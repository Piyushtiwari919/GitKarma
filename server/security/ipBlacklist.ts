import { Request, Response, NextFunction } from "express";
import redisClient from "../db/redis.js";

export const dailyIpBlacklist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const clientIp = req.ip;
    if (!clientIp) return next();
    const redisKey = `daily_usage:${clientIp}`;
    const blacklistKey = `blacklist:${clientIp}`;
    // 1. Check if they are already permanently banned for the day
    const isBanned = await redisClient.get(blacklistKey);
    if (isBanned) {
      return res.status(403).json({
        success: false,
        message:
          "Your IP has been temporarily blocked as your Daily limit exceeded.",
      });
    }

    // 2. Increment their daily counter
    const requestsToday = await redisClient.incr(redisKey);

    // 3. If this is their first request today, set the counter to expire in 24 hours
    if (requestsToday == 1) {
      await redisClient.expire(redisKey, 86400);
    }

    // 4. If they exceed 100 profiles a day, move them to the blacklist
    if (requestsToday > 100) {
      await redisClient.set(blacklistKey, "BANNED", "EX", 86400); // Ban for 24 hours
      console.warn(`[SECURITY] IP ${clientIp} blacklisted for 24 hours.`);
      return res.status(403).json({
        success: false,
        message: "Daily limit exceeded. IP Blacklisted.",
      });
    }

    next();
  } catch (err) {
    console.error("IP Blacklist Error:", err);
    next(); // Does not break the whole app
  }
};
