import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface ScoreData {
  username: string;
  githubScore: number;
  percentileScore: number | null;
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

const Metric = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) => (
  <div className="flex items-center gap-3 rounded-xl border border-[#21262d] bg-[#0d1117] p-4">
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#161b22] text-[#8b949e]">
      {icon}
    </div>

    <div>
      <p className="text-[11px] uppercase tracking-wider text-[#7d8590]">
        {label}
      </p>
      <p className="mt-0.5 font-mono text-lg font-semibold text-[#e6edf3]">
        {value.toLocaleString()}
      </p>
    </div>
  </div>
);

const Icon = ({ children }: { children: ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-4 w-4"
  >
    {children}
  </svg>
);

export const ScoreDashboard = ({ userData }: ScoreDashboardProps) => {
  const { username, githubScore, percentileScore, personaTitle, metrics } =
    userData;

  const hasPercentile =
    typeof percentileScore === "number" && Number.isFinite(percentileScore);

  const topPercent = hasPercentile ? Math.max(0, 100 - percentileScore) : null;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between border-b border-[#21262d] pb-6">
        <div className="flex items-center gap-3">
          <img
            src={`https://github.com/${username}.png`}
            alt={`${username}'s avatar`}
            className="h-12 w-12 rounded-full border border-[#30363d]"
          />

          <div>
            <h1 className="font-mono text-lg font-semibold text-[#f0f6fc]">
              @{username}
            </h1>

            <p className="text-xs text-[#8b949e]">{personaTitle}</p>
          </div>
        </div>

        <Link
          to="/"
          className="rounded-lg border border-[#30363d] px-3 py-2 text-xs font-medium text-[#c9d1d9] transition hover:bg-[#161b22]"
        >
          New score
        </Link>
      </header>

      {/* Main */}
      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Score */}
        <div className="relative overflow-hidden rounded-2xl border border-[#30363d] bg-[#0d1117] p-7 sm:p-10">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#2ea043]/5 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[#7d8590]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3fb950]" />
              GitKarma Score
            </div>

            <div className="mt-6 flex items-end gap-3">
              <span className="font-mono text-7xl font-bold tracking-[-0.07em] text-[#f0f6fc] sm:text-8xl">
                {githubScore}
              </span>

              <span className="mb-3 font-mono text-sm text-[#7d8590]">
                / 100
              </span>
            </div>

            <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-[#21262d]">
              <div
                className="h-full rounded-full bg-[#2ea043]"
                style={{
                  width: `${Math.min(100, Math.max(0, githubScore))}%`,
                }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-[#7d8590]">
              <span>Profile score</span>
              <span className="font-mono text-[#3fb950]">calculated</span>
            </div>
          </div>
        </div>

        {/* Percentile */}
        <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-7 sm:p-10">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#7d8590]">
            Percentile
          </p>

          {hasPercentile ? (
            <div className="mt-7">
              <div className="flex items-center gap-6">
                <div
                  className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#2ea043 ${percentileScore}%, #30363d ${percentileScore}% 100%)`,
                  }}
                >
                  <div className="flex h-23.5 w-23.5 items-center justify-center rounded-full bg-[#161b22]">
                    <div className="text-center">
                      <p className="font-mono text-2xl font-bold text-[#f0f6fc]">
                        {percentileScore % 1 === 0
                          ? percentileScore
                          : percentileScore.toFixed(1)}
                      </p>

                      <p className="text-[10px] uppercase tracking-wider text-[#7d8590]">
                        PERCENTILE
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-[#8b949e]">You are in</p>

                  <p className="mt-1 font-mono text-3xl font-bold text-[#3fb950]">
                    Top{" "}
                    {topPercent! % 1 === 0
                      ? topPercent
                      : topPercent!.toFixed(1)}
                    %
                  </p>
                </div>
              </div>

              <div className="mt-8 border-t border-[#30363d] pt-4 text-xs text-[#7d8590]">
                Population ranking · hourly refresh
              </div>
            </div>
          ) : (
            <div className="mt-7">
              <div className="flex items-center gap-5">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-dashed border-[#484f58]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="h-8 w-8 text-[#8b949e]"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </div>

                <div>
                  <p className="text-lg font-semibold text-[#e6edf3]">
                    Updating
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#8b949e]">
                    Percentile will appear
                    <br />
                    after the next ranking run.
                  </p>
                </div>
              </div>

              <div className="mt-8 border-t border-[#30363d] pt-4 text-xs text-[#7d8590]">
                Score is valid · ranking unavailable
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Metrics */}
      <section className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Commits"
          value={metrics.totalCommits}
          icon={
            <Icon>
              <circle cx="12" cy="12" r="3" />
              <path d="M3 12h6M15 12h6" />
            </Icon>
          }
        />

        <Metric
          label="Merged PRs"
          value={metrics.mergedPRs}
          icon={
            <Icon>
              <circle cx="6" cy="6" r="3" />
              <circle cx="18" cy="18" r="3" />
              <path d="M9 6h3a6 6 0 016 6v3" />
            </Icon>
          }
        />

        <Metric
          label="Stars"
          value={metrics.totalStars}
          icon={
            <Icon>
              <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9L12 3z" />
            </Icon>
          }
        />

        <Metric
          label="Followers"
          value={metrics.followers}
          icon={
            <Icon>
              <circle cx="9" cy="8" r="4" />
              <path d="M3 21v-2a6 6 0 016-6h2a6 6 0 016 6v2" />
            </Icon>
          }
        />
      </section>
    </main>
  );
};

export default ScoreDashboard;
