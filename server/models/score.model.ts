import { Schema, model } from "mongoose";
import User from "./user.model.js";

// Step 1: Define a sub-schema for individual historical data points
const scoreEntrySchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    baseScore: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: false }, // Prevents unnecessary ObjectId generation for subdocuments
);

// Step 2: Define the main score schema
const scoreSchema = new Schema(
  {
    githubUsername: {
      type: String,
      required: true,
      unique: true, // Ensures one main score document per GitHub user
      index: true,
      ref: "User",
    },
    scores: [scoreEntrySchema], // Array optimized for graph mapping/time-series rendering
  },
  { timestamps: true },
);

// Optimize database queries for timeline/graph lookups
scoreSchema.index({ githubUsername: 1, "scores.date": 1 });

const Score = model("Score", scoreSchema);

export default Score;
