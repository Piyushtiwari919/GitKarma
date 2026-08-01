interface RepositoryNode {
  stargazerCount: number;
}

interface GraphQLUserResponse {
  data?: {
    user: {
      followers: { totalCount: number };
      pullRequests: { totalCount: number };
      contributionsCollection: {
        totalCommitContributions: number;
        restrictedContributionsCount: number;
      };
      repositories: {
        nodes: RepositoryNode[];
      };
    } | null;
  };
  errors?: Array<{
    type?: string;
    message: string;
  }>;
}

export { RepositoryNode, GraphQLUserResponse };
