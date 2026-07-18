import "dotenv/config";
import express from "express";
import connectDB from "./db/connection.js";
import redisClient, { connectRedis } from "./db/redis.js";
import userRouter from "./routes/user.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT: string | number = process.env.PORT || 5000;

app.use("/", userRouter);

const startServer = async () => {
  try {
    await Promise.all([connectDB(), connectRedis()]);

    console.log("All databases connected successfully");
    app.listen(PORT, () => {
      console.log(`Server is listening at port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to initialize application dependencies:", err);
    process.exit(1);
  }
};

startServer();
