import { Request, Response } from "express";
import { QueueEvents } from "bullmq";
import { validateUserName } from "../utils/validate.js";
import redisClient from "../db/redis.js";
import { githubScoreQueue } from "../queue/githubScoreQueue.js";
import User from "../models/user.model.js";

export const getUserInfo = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { username } = req.body;

    // 1. Input Validation
    if (validateUserName(username)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing GitHub username.",
      });
    }

    const cleanUsername = username.trim();

    const userCacheData = await redisClient.get(`username:${cleanUsername}`);
    console.log(userCacheData);

    if (userCacheData) {
      return res.status(200).json({
        success: true,
        data: JSON.parse(userCacheData),
      });
    }

    //* Check The Vault (MongoDB) before queueing a job
    const existingMongoData = await User.findOne({
      githubUsername: cleanUsername,
    });

    // Define freshness (e.g., data is less than 8 hours old)
    const EIGHT_HOURS = 8 * 60 * 60 * 1000;
    const isDataFresh =
      existingMongoData &&
      Date.now() - new Date(existingMongoData.lastAnalyzedAt).getTime() <
        EIGHT_HOURS;

    if (isDataFresh) {
      // Self-Heal Redis: Put the valid MongoDB data back into Redis
      const metrics = existingMongoData.metrics;
      const payload = {
        username: existingMongoData.githubUsername,
        githubScore: existingMongoData.currentScore,
        metrics: {
          followers: metrics[0].followers ?? 0,
          mergedPRs: metrics[0].pullRequests ?? 0,
          totalCommits: metrics[0].commits ?? 0,
          totalStars: metrics[0].stars ?? 0,
        },
        personaTitle: existingMongoData.personaTitle,
        percentileScore: existingMongoData.percentile,
      };

      await redisClient.set(
        `username:${cleanUsername}`,
        JSON.stringify(payload),
        "EX",
        3600,
      );

      // Serve directly to the user instantly
      return res.status(200).json({
        success: true,
        data: payload,
      });
    }

    const customJobId = `user-${cleanUsername}`;
    const existingJob = await githubScoreQueue.getJob(customJobId);

    if (!existingJob) {
      const job = await githubScoreQueue.add(
        "calculate-score",
        { cleanUsername },
        {
          jobId: customJobId,
        },
      );
      return res.status(202).json({ message: "Accepted", job });
    } else {
      const state = await existingJob.getState();

      if (state === "waiting" || state === "active") {
        return res.status(202).json({
          message: "Job is already being processed",
          jobId: customJobId,
          state,
        });
      }

      if (state === "failed") {
        // remove and recreate if already made three attempts
        if (existingJob.attemptsMade === 3) {
          await existingJob.remove();
          const job = await githubScoreQueue.add(
            "calculate-score",
            { cleanUsername },
            {
              jobId: customJobId,
            },
          );
          return res.status(202).json({
            message: "Job is recreated and pushed to the queue",
            job,
          });
        }
        return res.status(202).json({
          message: "Job is failed and will retry after few seconds",
        });
      }

      const userCacheJobData = await redisClient.get(
        `username:${cleanUsername}`,
      );
      if (userCacheJobData) {
        return res.status(200).json({
          message: "Job is completed",
          data: JSON.parse(userCacheJobData),
        });
      }
      return res.status(202).json({
        message: "Job is completed",
        jobId: customJobId,
        state,
      });
    }
  } catch (err: any) {
    console.error("Error in getUserInfo controller:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

// Initializing the listener ONCE outside the controller (Singleton)
const githubScoreQueueEvents = new QueueEvents("github-score-queue");

export const getJobProgress = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const cleanJobId = (jobId as string).trim();

    const job = await githubScoreQueue.getJob(cleanJobId);

    if (!job) {
      // 1. Job is missing from Redis. Did it already finish and save to MongoDB?
      const username = cleanJobId.replace("user-", "");

      const userData = await User.findOne({ githubUsername: username });

      if (userData) {
        // 2. The job finished so fast it beat the SSE connection.
        // Fast-finish edge case
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform", // FIX 1: Prevent proxy compression
          Connection: "keep-alive",
          "X-Accel-Buffering": "no", // FIX 2: Disable proxy buffering
        });
        res.flushHeaders(); // FIX 3: Force headers down the TCP pipe immediately

        res.write(
          `id: ${jobId}\nevent: completed\ndata: ${JSON.stringify({ status: "done", message: "Already completed" })}\n\n`,
        );
        res.end();
        return;
      }
      // If we haven't sent headers yet, a standard 404 is cleaner than an SSE error stream
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Main SSE Connection
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform", // FIX 1
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // FIX 2
    });
    res.flushHeaders(); // FIX 3

    // Reconnection Handling: Send current state immediately.
    const currentProgress = job.progress;
    res.write(
      `id: ${jobId}\nevent: progress\ndata: ${JSON.stringify(currentProgress)}\n\n`,
    );

    const isCompleted = await job.isCompleted();
    const isFailed = await job.isFailed();

    if (isCompleted || isFailed) {
      const eventName = isCompleted ? "completed" : "error";
      res.write(
        `event: ${eventName}\ndata: ${JSON.stringify({ message: "Job finished" })}\n\n`,
      );
      return res.end();
    }

    // Define precise event handlers filtered by jobId

    const onProgress = ({ jobId: eventJobId, data }: any) => {
      if (eventJobId === jobId) {
        res.write(
          `id: ${jobId}\nevent: progress\ndata: ${JSON.stringify(data)}\n\n`,
        );
        // If the job completed or got rejected, close the SSE connection cleanly
        if (data.step === "REJECTED") {
          cleanup();
        }
      }
    };

    const onCompleted = ({ jobId: eventJobId }: any) => {
      if (eventJobId === jobId) {
        res.write(
          `id: ${jobId}\nevent: completed\ndata: ${JSON.stringify({ status: "done" })}\n\n`,
        );
        cleanup();
      }
    };

    const onFailed = ({ jobId: eventJobId, failedReason }: any) => {
      if (eventJobId === jobId) {
        res.write(
          `id: ${jobId}\nevent: error\ndata: ${JSON.stringify({ error: failedReason })}\n\n`,
        );
        cleanup();
      }
    };

    // Attach listeners to the singleton
    githubScoreQueueEvents.on("progress", onProgress);
    githubScoreQueueEvents.on("completed", onCompleted);
    githubScoreQueueEvents.on("failed", onFailed);

    // Cleanup function to prevent memory leaks on the singleton
    const cleanup = () => {
      githubScoreQueueEvents.off("progress", onProgress);
      githubScoreQueueEvents.off("completed", onCompleted);
      githubScoreQueueEvents.off("failed", onFailed);
      res.end();
    };

    // If client closes the tab/drops connection
    req.on("close", cleanup);
  } catch (err: any) {
    console.error("Error in getJobProgress:", err);
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: err.message });
    }
    // If headers were already sent, we must send an SSE error format
    res.write(
      `event: error\ndata: ${JSON.stringify({ error: "Internal server error" })}\n\n`,
    );
    res.end();
  }
};
