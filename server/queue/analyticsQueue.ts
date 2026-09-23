import { Queue } from "bullmq";
import { createBullMQClient } from "../db/redis.js";

const connection = createBullMQClient();

export const analyticsQueue = new Queue("analytics-queue", {
  connection,
});
