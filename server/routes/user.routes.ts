import { Router } from "express";
import { getUserInfo, getJobProgress } from "../controllers/user.controller.js";
import { ipRateLimiter } from "../middlewares/rateLimit.middleware.js";
import { dailyIpBlacklist } from "../security/ipBlacklist.js";

const userRouter = Router();

userRouter.post(
  "/api/user/getInfo",
  dailyIpBlacklist,
  ipRateLimiter,
  getUserInfo,
);

userRouter.get("/api/user/progress/:jobId", getJobProgress);

export default userRouter;
