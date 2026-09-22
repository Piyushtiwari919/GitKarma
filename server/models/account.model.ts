import { Schema, model } from "mongoose";

const flaggedAccountSchema = new Schema(
  {
    githubUserName: {
      type: String,
      required: true,
      unique: true,
    },
    reason: {
      type: String,
      required: true,
    },
    flaggedAt: {
      type: Date,
      default: Date.now,
    },
    flaggedBy: {
      type: String,
    },
  },
  { timestamps: true },
);

const FlaggedAccount = model("FlaggedAccount", flaggedAccountSchema);

export default FlaggedAccount;
