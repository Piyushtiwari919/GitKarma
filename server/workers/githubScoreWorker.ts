import "dotenv/config";
import { createNodeRedisClient, Worker, Job, UnrecoverableError } from "bullmq";

import { createClient } from "redis";
import { GITHUB_USER_QUERY } from "../utils/githubQuery.js";
import { GraphQLUserResponse } from "../types.js";
import User from "../models/user.model.js";
import { calculateGitHubScore } from "../utils/scoreCalculate.js";
import connectDB from "../db/connection.js";

const workerRedisClient = createClient({
  url: process.env.REDIS_URL || `redis://localhost:6379`,
});

await workerRedisClient.connect();

await connectDB();

const connection = createNodeRedisClient(workerRedisClient);
const token = process.env.GITHUB_PAT;

const backgroundWorker = new Worker(
  "github-score-queue",
  async (job) => {
    if (!token) {
      throw new Error("GITHUB_PAT is not configured");
    }
    console.log("🔥 WORKER RECEIVED JOB");
    console.log("Job ID:", job.id);
    console.log("Job Name:", job.name);
    console.log("Job Data:", job.data);

    const { cleanUsername } = job?.data;

    //1. Execute GraphQL RequestJob
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "GitHub-Score-App/1.0",
      },
      body: JSON.stringify({
        query: GITHUB_USER_QUERY,
        variables: { login: cleanUsername },
      }),
    });

    await job.updateProgress(25);

    const rateLimitReset = response.headers.get("x-ratelimit-reset");
    // const retryAfterHeader = response.headers.get("retry-after");

    // console.log(retryAfterHeader);
    console.log("Status:", response.status);
    console.log("OK:", response.ok);

    console.log("Rate limit:");
    console.log("Limit:", response.headers.get("x-ratelimit-limit"));
    console.log("Remaining:", response.headers.get("x-ratelimit-remaining"));
    console.log("Used:", response.headers.get("x-ratelimit-used"));
    console.log("Reset:", rateLimitReset);
    console.log("Resource:", response.headers.get("x-ratelimit-resource"));

    console.log("Retry-After:", response.headers.get("retry-after"));

    if (!response.ok) {
      if (response.status === 403 || response.status === 429) {
        throw new Error(
          `GitHub API rate limit exceeded. Reset: ${rateLimitReset}`,
        );
      }

      throw new Error(
        `GitHub HTTP Error: ${response.status} ${response.statusText}`,
      );
    }

    const result = (await response.json()) as GraphQLUserResponse;

    // 2. Handle GraphQL Payload Level Errors
    if (result.errors && result.errors.length > 0) {
      const isNotFound = result.errors.some(
        (err) =>
          err.type === "NOT_FOUND" ||
          err.message.toLowerCase().includes("could not resolve to a user"),
      );

      if (isNotFound) {
        throw new UnrecoverableError(
          `User '${cleanUsername}' not found on GitHub.`,
        );
      }

      throw new Error("GraphQL Query Error");
    }

    await job.updateProgress(50);

    const userData = result.data?.user;
    if (!userData) {
      throw new Error(`User '${cleanUsername}' not found on GitHub.`);
    }

    // 3. Aggregate Raw Data for the Scoring Engine
    const totalStars = userData.repositories.nodes.reduce(
      (sum, repo) => sum + (repo.stargazerCount || 0),
      0,
    );

    const totalCommits =
      userData.contributionsCollection?.totalCommitContributions +
      userData.contributionsCollection?.restrictedContributionsCount;

    const aggregatedMetrics = {
      username: cleanUsername,
      followers: userData.followers.totalCount,
      mergedPRs: userData.pullRequests.totalCount,
      totalCommits,
      totalStars,
    };

    const githubScore = calculateGitHubScore({
      totalCommits,
      totalStars,
      mergedPRs: userData.pullRequests.totalCount,
      followers: userData.followers.totalCount,
    });

    await job.updateProgress(75);

    const personaTitle = "Open Source Architect";

    const finalResponsePayload = {
      username: cleanUsername,
      githubScore,
      metrics: aggregatedMetrics,
      personaTitle,
    };

    await Promise.all([
      User.findOneAndUpdate(
        { githubUsername: cleanUsername },
        {
          $set: {
            currentScore: githubScore,
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
              $slice: -1,
            },
          },
        },
        {
          upsert: true,
          returnDocument: "after",
        },
      ),

      workerRedisClient.set(
        `username:${cleanUsername}`,
        JSON.stringify(finalResponsePayload),
        { EX: 7200 }, // 2-hour TTL
      ),
    ]);

    await job.updateProgress(100);

    return {
      success: true,
      username: job.data.cleanUsername,
    };
  },
  {
    connection: connection,
    concurrency: 7,
    lockDuration: 45000, // Extend lock to 45 seconds (gives slow APIs more breathing room)
    maxStalledCount: 2,  // Allow a job to stall and be retried twice before failing it permanently
    stalledInterval: 30000, // Check for stalled jobs every 30 seconds
  },
);

backgroundWorker.on("active", (job) => {
  console.log(`🟡 Job ${job.id} is now active`);
});

backgroundWorker.on("completed", (job) => {
  console.log(`🟢 Job ${job.id} completed`);
});

// --- MONITORING STALLED JOBS ---
backgroundWorker.on('stalled', (jobId: string, prev: string) => {
  console.warn(
    `[SYSTEM WARNING] Job ${jobId} stalled! 
    Previous state: ${prev}. 
    This means the worker crashed or the Node Event Loop was blocked for too long.
    BullMQ will automatically push it back to the Waiting queue.`
  );
});

backgroundWorker.on("failed", (job, error) => {
  console.error(`🔴 Job ${job?.id} failed`);
  console.error(error);
});

backgroundWorker.on("error", (error) => {
  console.error("🔥 Worker error:", error);
});
