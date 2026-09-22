interface BotMetrics {
  commits: number;
  prs: number;
  followers: number;
}

const isBot = (metrics: BotMetrics): boolean => {
  console.log(metrics);
  return (
    metrics.commits >= 5000 && metrics.prs === 0 && metrics.followers === 0
  );
};

export { isBot };
