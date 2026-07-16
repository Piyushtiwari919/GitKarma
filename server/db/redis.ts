import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || `redis://localhost:6379`,
});

redisClient.on("error", (err) => console.log("Redis Client Error: ", err));
redisClient.on("connect", () =>
  console.log("Successfully connected to Redis"),
);

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    await redisClient.set("ping", "pong");
    const value = await redisClient.get("ping");
    console.log("Test value from Redis:", value);
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    process.exit(1);
  }
};

export default redisClient;
