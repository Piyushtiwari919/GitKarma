import User from "../models/user.model.js";

export const calculateScoreDistribution = async () => {
  const boundaries = Array.from({ length: 102 }, (_, i) => i);
  const distribution = await User.aggregate([
    {
      // Stage 1: Only evaluate users who actually have a score
      $match: {
        currentScore: { $exists: true, $ne: null },
      },
    },
    {
      // Stage 2: The Bucket Operator
      $bucket: {
        groupBy: "$currentScore",
        boundaries: boundaries,
        default: "Outliers", // Catches any weird data < 0 or >= 101
        output: {
          // Every time a user falls in this bucket, add 1 to the count
          userCount: { $sum: 1 },
        },
      },
    },
    {
      // Stage 3: Sort buckets from 0 to 100 so the array is in order
      $sort: { _id: 1 },
    },
  ]);

  return distribution;
};
