import { Schema, model } from "mongoose";
const scoreSchema = new Schema(
  {
    githubUsername: {
      type: String,
      required: true,
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
