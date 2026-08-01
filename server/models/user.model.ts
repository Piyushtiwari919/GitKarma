import { Schema, model } from "mongoose";

const metricsSchema = new Schema(
  {
    commits: {
      type: Number,
    },
    pullRequests: {
      type: Number,
    },
    stars: {
      type: Number,
    },
    followers: {
      type: Number,
    },
  },
  { timestamps: true },
);

const userSchema = new Schema(
  {
    githubUsername: {
      type: String,
      unique: true,
      required: true,
    },
    currentScore: {
      type: Number,
      required: true,
    },
    metrics: [metricsSchema],
    personaTitle: {
      type: String,
    },
    lastAnalyzedAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

const User = model("User", userSchema);

export default User;
