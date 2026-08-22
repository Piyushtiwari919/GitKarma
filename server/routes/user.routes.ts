import { Router } from "express";
import { getUserInfo, getJobProgress } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.post("/api/user/getInfo", getUserInfo);

userRouter.get("/api/user/progress/:jobId", getJobProgress);

export default userRouter;
