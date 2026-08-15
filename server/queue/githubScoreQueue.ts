import { Queue, createNodeRedisClient } from "bullmq";
import redisClient from "../db/redis.js";

const connection = createNodeRedisClient(redisClient);

const githubScoreQueue = new Queue("github-score-queue", {
  connection,
  defaultJobOptions: {
    removeOnComplete: true,
    attempts: 3, // 1st original run + 2 retry execution
    backoff: {
      type: "exponential", // Retries after an exponential delay
      delay: 3000, // Waits exactly 3 seconds (3000ms) before retrying
    },
    removeOnFail: {
      count: 100,
      age: 1 * 3600,
    },
  },
});

export { githubScoreQueue, connection };
