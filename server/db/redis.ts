import {Redis} from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const redisClient = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

redisClient.on("error", (err) => console.log("Redis Client Error:", err));

redisClient.on("connect", () => console.log("Redis TCP Socket established"));

redisClient.on("ready", () =>
  console.log("Successfully connected to Redis and ready for commands"),
);

export const createBullMQClient = () => {
  return new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
  });
};

export const connectRedis = async () => {
  try {
    if (redisClient.status === "wait") {
      await redisClient.connect();
    } else if (redisClient.status !== "ready") {
      await new Promise<void>((resolve, reject) => {
        redisClient.once("ready", resolve);
        redisClient.once("error", reject);
      });
    }

    // This protects BullMQ from being deleted, regardless of where Redis is hosted
    await redisClient.call("CONFIG", "SET", "maxmemory-policy", "volatile-lru");
    console.log("🛡️ Redis Eviction Policy set to volatile-lru (BullMQ Safe)");

    await redisClient.set("ping", "pong");

    const value = await redisClient.get("ping");

    console.log("Test value from Redis:", value);
  } catch (error) {
    console.error("❌ Failed to connect to Redis:", error);
    process.exit(1);
  }
};

export default redisClient;
