import { Request, Response } from "express";
import { validateUserName } from "../utils/validate.js";
import redisClient from "../db/redis.js";
import { githubScoreQueue } from "../queue/githubScoreQueue.js";

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

    if (!userCacheData) {
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
        return res.status(202).json({
          message: "Job is completed",
          jobId: customJobId,
          state,
        });
      }
    } else {
      return res.status(200).json({
        success: true,
        data: JSON.parse(userCacheData),
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
