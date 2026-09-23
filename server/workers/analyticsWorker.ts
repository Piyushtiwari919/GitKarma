import "dotenv/config";
import { Worker, Job, UnrecoverableError } from "bullmq";
import connectDB from "../db/connection.js";
import { calculateScoreDistribution } from "../services/analyticsService.js";
import { GlobalPercentileDistribution } from "../types/analytics.js";
import { calculatePercentile, UserData } from "../utils/calculatePercentile.js";
import redisClient, { connectRedis, createBullMQClient } from "../db/redis.js";

await Promise.all([connectRedis(), connectDB()]);

const workerConnection = createBullMQClient();

const analyticsWorker = new Worker(
  "analytics-queue",
  async (job: Job) => {
    const key = "global:scoreDistribution";
    const userDistribution: UserData[] = await calculateScoreDistribution();
    if (!userDistribution || userDistribution.length === 0) {
      throw new UnrecoverableError("Not Enough Data to calculate Percentile");
    }
    const userPercentile: GlobalPercentileDistribution =
      calculatePercentile(userDistribution);
    await redisClient.set(key, JSON.stringify(userPercentile));
    return { success: true, timestamp: Date.now() };
  },
  {
    connection: workerConnection,
    concurrency: 1,
    lockDuration: 50000,
  },
);

analyticsWorker.on("active", (job) => {
  console.log(`🟡 Job ${job.id} is now active`);
});

analyticsWorker.on("completed", (job, result) => {
  console.log(`🟢 Job ${job.id} completed. Result:`, result);
});

analyticsWorker.on("error", (err) => {
  console.error("[Analytics Worker Error]:", err);
});
