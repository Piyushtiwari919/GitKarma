import { rateLimit } from "express-rate-limit";
import { RedisStore, type RedisReply } from "rate-limit-redis";
import redisClient from "../db/redis.js";

const ipRateLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (command: string, ...args: string[]) =>
      redisClient.call(command, ...args) as Promise<RedisReply>,
  }),

  windowMs: 60 * 1000, // 1 minute
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  // Redis Crashes then it does not throw error
  passOnStoreError: true,

  //Error Handler
  handler: (req, res, next, options) => {
    // Read the Reset header (if draft-8, it calculates seconds remaining until reset)
    const retryAfter =
      res.getHeader("Retry-After") || Math.ceil(options.windowMs / 1000);
    return res.status(429).json({
      success: false,
      error: "Too Many Requests",
      message: "Rate limit exceeded. Please try again later.",
      retryAfterSeconds: Number(retryAfter),
      limit: options.limit,
    });
  },
});

export { ipRateLimiter };
