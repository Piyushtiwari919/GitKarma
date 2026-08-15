interface GitHubMetrics {
  totalCommits: number;
  mergedPRs: number;
  totalStars: number;
  followers: number;
}

export const calculateGitHubScore = (metrics: GitHubMetrics): number => {
  const { totalCommits, mergedPRs, totalStars, followers } = metrics;

  // 1. Commits (Max 60 pts) - 1-year cap at 1,500 commits
  const ANNUAL_COMMIT_CAP = 1500;
  const commitPoints =
    Math.min(totalCommits, ANNUAL_COMMIT_CAP) * (60 / ANNUAL_COMMIT_CAP);

  // 2. Merged PRs (Max 20 pts) - 1-year cap at 500 merged PRs
  const ANNUAL_PR_CAP = 500;
  const prPoints = Math.min(mergedPRs, ANNUAL_PR_CAP) * (20 / ANNUAL_PR_CAP);

  // 3. Stars (Max 10 pts) - Logarithmic scale (1,000 stars ≈ 10 pts)
  const starPoints = Math.min(10, Math.log(totalStars + 1) * 2.17);

  // 4. Followers (Max 10 pts) - Logarithmic scale (500 followers ≈ 10 pts)
  const followerPoints = Math.min(10, Math.log(followers + 1) * 1.61);

  // Total Score Calculation (Capped strictly at 100)
  const rawScore = commitPoints + prPoints + starPoints + followerPoints;
  const finalScore = Math.min(100, rawScore);

  return Number(finalScore.toFixed(2));
};
