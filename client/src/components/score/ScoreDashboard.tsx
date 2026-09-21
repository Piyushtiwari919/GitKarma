import { Link } from "react-router-dom";

// 1. Define strict TypeScript interfaces based on your backend response
interface ScoreData {
  username: string;
  githubScore: number;
  personaTitle: string;
  metrics: {
    totalCommits: number;
    mergedPRs: number;
    totalStars: number;
    followers: number;
  };
}

interface ScoreDashboardProps {
  userData: ScoreData;
}

// 2. Reusable Stat Card Component (Local to this file for now)
const StatCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) => (
  <div className="flex items-center gap-4 rounded-lg border border-[#30363d] bg-[#161b22] p-5 shadow-sm transition-transform hover:scale-[1.02]">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0d1117] text-[#8250df]">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-[#c9d1d9]">
        {value.toLocaleString()}
      </p>
    </div>
  </div>
);

export const ScoreDashboard = ({ userData }: ScoreDashboardProps) => {
  const { username, githubScore, personaTitle, metrics } = userData;

  return (
    <div className="mx-auto w-full max-w-5xl animate-fade-in pt-8 sm:pt-12">
      {/* 1. Header & Profile Section */}
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <img
            src={`https://github.com/${username}.png`}
            alt={`${username}'s avatar`}
            className="h-24 w-24 rounded-full border-4 border-[#30363d] object-cover sm:h-32 sm:w-32"
          />
          {/* Decorative Badge */}
          <div className="absolute -bottom-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full border-4 border-[#0d1117] bg-[#2ea043] text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <h1 className="mt-6 text-3xl font-extrabold text-[#c9d1d9] sm:text-4xl">
          @{username}
        </h1>
        <p className="mt-2 inline-flex rounded-full bg-[#8250df]/10 px-4 py-1 text-sm font-semibold text-[#8250df]">
          {personaTitle}
        </p>
      </div>

      {/* 2. Hero Score Section */}
      <div className="my-12 flex justify-center">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#30363d] bg-linear-to-b from-[#161b22] to-[#0d1117] p-10 px-20 shadow-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-gray-500">
            GitKarma Score
          </p>
          <div className="mt-2 text-7xl font-black tracking-tighter text-[#2ea043] drop-shadow-[0_0_15px_rgba(46,160,67,0.4)]">
            {githubScore}
          </div>
        </div>
      </div>

      {/* 3. Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Commits"
          value={metrics.totalCommits}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <line x1="3" y1="12" x2="9" y2="12"></line>
              <line x1="15" y1="12" x2="21" y2="12"></line>
            </svg>
          }
        />
        <StatCard
          label="Merged PRs"
          value={metrics.mergedPRs}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18" cy="18" r="3"></circle>
              <circle cx="6" cy="6" r="3"></circle>
              <path d="M13 6h3a2 2 0 0 1 2 2v7"></path>
              <line x1="6" y1="9" x2="6" y2="21"></line>
            </svg>
          }
        />
        <StatCard
          label="Total Stars"
          value={metrics.totalStars}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          }
        />
        <StatCard
          label="Followers"
          value={metrics.followers}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <polyline points="17 11 19 13 23 9"></polyline>
            </svg>
          }
        />
      </div>

      {/* 4. Action Bar */}
      <div className="mt-12 flex justify-center pb-12">
        <Link
          to="/"
          className="rounded-md border border-[#30363d] bg-transparent px-6 py-3 text-sm font-medium text-[#c9d1d9] transition-colors hover:bg-[#30363d] focus:outline-none focus:ring-2 focus:ring-[#8250df] focus:ring-offset-2 focus:ring-offset-[#0d1117]"
        >
          Calculate Another Score
        </Link>
      </div>
    </div>
  );
};

export default ScoreDashboard;
