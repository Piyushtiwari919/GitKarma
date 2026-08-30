import { Schema, model } from "mongoose";
import User from "./user.model.js";
const scoreSchema = new Schema(
  {
    githubUsername: {
      type: String,
      required: true,
      ref:User
    },
    scores: {
      type: [Number],
      default: [],
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const Score = model("Score", scoreSchema);

export default Score;
