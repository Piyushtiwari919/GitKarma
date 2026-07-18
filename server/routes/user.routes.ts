import { Router } from "express";
import { getUserInfo } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.get("/user/getInfo", getUserInfo);

export default userRouter;
