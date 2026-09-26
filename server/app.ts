import "dotenv/config";
import express from "express";
import connectDB from "./db/connection.js";
import cors from "cors";
import redisClient, { connectRedis } from "./db/redis.js";
import userRouter from "./routes/user.routes.js";
import { analyticsScheduler } from "./utils/analyticsScheduler.js"; // Kept separate as requested

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Trust the first proxy hop to correctly parse the X-Forwarded-For header(rate-limiting)
app.set("trust proxy", 1);

const PORT: string | number = process.env.PORT || 5000;

app.use("/", userRouter);

// flag to distinguish between server boot and Redis crash recovery
let isInitialBoot = true;

// Listen for Redis reconnections directly in app.ts
redisClient.on("ready", async () => {
  if (isInitialBoot) {
    // Let startServer() handle the first initialization
    isInitialBoot = false;
    return;
  }

  console.log(
    "[Disaster Recovery] Redis reconnected after a drop. Restoring Cron Jobs...",
  );
  try {
    // Re-upsert the job into the fresh Redis memory
    await analyticsScheduler();
    console.log("[Disaster Recovery] Cron Jobs successfully restored.");
  } catch (err) {
    console.error("[Disaster Recovery] Failed to restore Cron Jobs:", err);
  }
});

const startServer = async () => {
  try {
    // Boot databases first
    await Promise.all([connectDB(), connectRedis()]);

    // Upsert the cron schedule ONLY AFTER Redis is connected
    await analyticsScheduler();

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
