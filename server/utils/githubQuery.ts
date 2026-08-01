// --- Parameterized GraphQL Query ---
export const GITHUB_USER_QUERY = `
  query GetGitHubUserData($login: String!) {
    user(login: $login) {
      followers {
        totalCount
      }
      pullRequests(states: MERGED) {
        totalCount
      }
      contributionsCollection {
        totalCommitContributions
        restrictedContributionsCount
      }
      repositories(
        first: 100
        ownerAffiliations: OWNER
        orderBy: { field: STARGAZERS, direction: DESC }
      ) {
        nodes {
          stargazerCount
        }
      }
    }
  }
`;
