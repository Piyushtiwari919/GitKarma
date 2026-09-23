import { analyticsQueue } from "../queue/analyticsQueue.js";

export const analyticsScheduler = async () => {
  try {
    await analyticsQueue.upsertJobScheduler(
      "analytic-schedulder",
      {
        pattern: "0 * * * *",
      },
      {
        name: "analytics-job",
        opts: {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
          removeOnFail: true,
          removeOnComplete: true,
        },
      },
    );
  } catch (error) {
    console.error("❌ Failed to register scheduler:", error);
  }
};
