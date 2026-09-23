/**
 * Represents the global score distribution cached in Redis.
 * The index of the array corresponds to the Math.floor(score).
 * The value at that index is the percentile rank (0-100).
 */
export type GlobalPercentileDistribution = number[];