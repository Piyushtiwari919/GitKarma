import "dotenv/config";
import { Worker, Job, UnrecoverableError } from "bullmq";

import { GITHUB_USER_QUERY } from "../utils/githubQuery.js";
import { GraphQLUserResponse } from "../types.js";
import User from "../models/user.model.js";
import FlaggedAccount from "../models/account.model.js";
import { calculateGitHubScore } from "../utils/scoreCalculate.js";
import connectDB from "../db/connection.js";
import { isBot } from "../security/botDetector.js";
import redisClient, { connectRedis, createBullMQClient } from "../db/redis.js";

const GITHUB_PAT = process.env.GITHUB_PAT;

await Promise.all([connectRedis(), connectDB()]);

const workerConnection = createBullMQClient();

const backgroundWorker = new Worker(
  "github-score-queue",
  async (job: Job) => {
    // 2. Remove the global try/catch so BullMQ can intercept throws for retries.
    if (!GITHUB_PAT) {
      throw new Error("GITHUB_PAT is not configured");
    }

    const { cleanUsername } = job.data;
    if (!cleanUsername) {
      throw new UnrecoverableError("cleanUsername is missing from job data");
    }

    console.log(
      `🔥 WORKER RECEIVED JOB [ID: ${job.id}] - User: ${cleanUsername}`,
    );

    // --- 1. Execute GraphQL Request ---
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GITHUB_PAT}`,
        "User-Agent": "GitHub-Score-App/1.0",
      },
      body: JSON.stringify({
        query: GITHUB_USER_QUERY,
        variables: { login: cleanUsername },
      }),
    });

    await job.updateProgress({ step: "FETCHED_DATA", progress: 25 });

    if (!response.ok) {
      const rateLimitReset = response.headers.get("x-ratelimit-reset");
      if (response.status === 403 || response.status === 429) {
        // Throwing here lets BullMQ automatically push it back for a retry
        throw new Error(
          `GitHub API rate limit exceeded. Reset: ${rateLimitReset}`,
        );
      }
      throw new Error(
        `GitHub HTTP Error: ${response.status} ${response.statusText}`,
      );
    }

    const result = (await response.json()) as GraphQLUserResponse;

    // --- 2. Handle GraphQL Payload Level Errors ---
    if (result.errors && result.errors.length > 0) {
      const isNotFound = result.errors.some(
        (err) =>
          err.type === "NOT_FOUND" ||
          err.message.toLowerCase().includes("could not resolve to a user"),
      );

      if (isNotFound) {
        // UnrecoverableError tells BullMQ NOT to retry this job
        throw new UnrecoverableError(
          `User '${cleanUsername}' not found on GitHub.`,
        );
      }
      throw new Error(`GraphQL Query Error: ${result.errors[0].message}`);
    }

    await job.updateProgress({ step: "CALCULATING_SCORE", progress: 50 });

    const userData = result.data?.user;
    if (!userData) {
      throw new UnrecoverableError(
        `User '${cleanUsername}' data is malformed or missing.`,
      );
    }

    // --- 3. Aggregate Raw Data ---
    const totalStars = userData.repositories.nodes.reduce(
      (sum, repo) => sum + (repo.stargazerCount || 0),
      0,
    );

    const totalCommits =
      (userData.contributionsCollection?.totalCommitContributions || 0) +
      (userData.contributionsCollection?.restrictedContributionsCount || 0);

    // --- 4. Bot Detection ---
    if (
      isBot({
        commits: totalCommits,
        prs: userData.pullRequests.totalCount,
        followers: userData.followers.totalCount,
      })
    ) {
      await job.updateProgress({
        step: "REJECTED",
        progress: 100,
        reason: "BOT_DETECTED",
        message: "Account flagged for automated/non-standard activity.",
      });

      // BUG FIX: Changed findById to findOne. findById expects an ObjectId, not an object.
      const isUserExists = await FlaggedAccount.findOne({
        githubUserName: cleanUsername,
      });

      if (!isUserExists) {
        await FlaggedAccount.create({
          githubUserName: cleanUsername,
          reason: "BOT_ACCOUNT",
          flaggedBy: "System_Worker",
        });
      }

      // Safe to return directly because bot detection is an intentional short-circuit, not a failure.
      return { success: false, status: "REJECTED", reason: "BOT_DETECTED" };
    }

    // --- 5. Calculate Score ---
    const aggregatedMetrics = {
      followers: userData.followers.totalCount,
      mergedPRs: userData.pullRequests.totalCount,
      totalCommits,
      totalStars,
    };

    const githubScore = calculateGitHubScore(aggregatedMetrics);

    await job.updateProgress({ step: "CALCULATED_SCORE", progress: 75 });

    // TODO: Build a title generation engine
    const personaTitle = "Open Source Architect";

    let percentileDataRaw = await redisClient.get("global:scoreDistribution");
    let percentileData: any = null;
    let percentileScore: number | null = null;
    if (percentileDataRaw) {
      percentileData = JSON.parse(percentileDataRaw);
      percentileScore = percentileData[Math.floor(githubScore)];
    }
    const finalResponsePayload = {
      username: cleanUsername,
      githubScore,
      metrics: aggregatedMetrics,
      percentileScore: percentileScore,
      personaTitle,
    };

    console.log(finalResponsePayload);

    // --- 6. Write to DB and Cache ---
    await Promise.all([
      User.findOneAndUpdate(
        { githubUsername: cleanUsername },
        {
          $set: {
            currentScore: githubScore,
            percentile: percentileScore,
            personaTitle: personaTitle,
            lastAnalyzedAt: new Date(),
          },
          $push: {
            metrics: {
              $each: [
                {
                  commits: aggregatedMetrics.totalCommits,
                  pullRequests: aggregatedMetrics.mergedPRs,
                  stars: aggregatedMetrics.totalStars,
                  followers: aggregatedMetrics.followers,
                },
              ],
              $slice: -1, // Note: This keeps only the MOST RECENT metric. If you want history, change this to -10, -50, etc.
            },
          },
        },
        { upsert: true, returnDocument: "after" },
      ),

      // Use the dedicated cache client here!
      redisClient.set(
        `username:${cleanUsername}`,
        JSON.stringify(finalResponsePayload),
        "EX",
        7200,
      ),
    ]);

    await job.updateProgress({ step: "FINISHED_EXECUTION", progress: 100 });

    return { success: true, username: cleanUsername };
  },
  {
    connection: workerConnection,
    concurrency: 7,
    lockDuration: 45000,
    maxStalledCount: 2,
    stalledInterval: 30000,
  },
);

// --- MONITORING ---
backgroundWorker.on("active", (job) => {
  console.log(`🟡 Job ${job.id} is now active`);
});

backgroundWorker.on("completed", (job, result) => {
  console.log(`🟢 Job ${job.id} completed. Result:`, result);
});

backgroundWorker.on("stalled", (jobId: string, prev: string) => {
  console.warn(
    `[SYSTEM WARNING] Job ${jobId} stalled! Previous state: ${prev}. ` +
      `Node Event Loop might be blocked.`,
  );
});

// Because we removed the try/catch, this will now properly fire when the API fails!
backgroundWorker.on("failed", (job, error) => {
  console.error(`🔴 Job ${job?.id} failed. Reason:`, error.message);
});

backgroundWorker.on("error", (error) => {
  console.error("🔥 Worker connection error:", error);
});
