import { Link } from "react-router-dom";

export interface RejectionInfo {
  reason: string;
  message?: string;
}

interface BotDetectedProps {
  username: string;
  rejectionData: RejectionInfo | null;
}

const BotDetected = ({ username }: BotDetectedProps) => {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#0d1117] px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="overflow-hidden rounded-2xl border border-[#30363d] bg-[#161b22]">
          <div className="flex items-center gap-3 border-b border-[#30363d] px-6 py-4">
            <img
              src={`https://github.com/${username}.png`}
              alt={`${username}'s avatar`}
              className="h-10 w-10 rounded-full border border-[#30363d]"
            />

            <div>
              <p className="font-mono text-sm font-semibold text-[#e6edf3]">
                @{username}
              </p>

              <p className="text-xs text-[#7d8590]">GitKarma profile check</p>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#9e6a03]/30 bg-[#9e6a03]/10 text-[#d29922]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3l9 18H3L12 3z"
                />
                <path strokeLinecap="round" d="M12 9v4" />
                <path strokeLinecap="round" d="M12 17h.01" />
              </svg>
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-tight text-[#f0f6fc]">
              Profile not eligible for scoring
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#8b949e]">
              This profile matched GitKarma's automated activity checks, so a
              score was not generated.
            </p>

            <div className="mt-6 rounded-xl border border-[#30363d] bg-[#0d1117] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#21262d] text-[#8b949e]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v4m0 4h.01M10.3 3.5h3.4L21 17.2a1.5 1.5 0 01-1.3 2.3H4.3A1.5 1.5 0 013 17.2L10.3 3.5z"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-sm font-medium text-[#c9d1d9]">
                    No GitKarma score assigned
                  </p>

                  <p className="mt-0.5 text-xs text-[#7d8590]">
                    This only affects GitKarma scoring.
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/"
              className="mt-7 inline-flex w-full items-center justify-center rounded-lg bg-[#238636] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2ea043]"
            >
              Check another profile
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-[#484f58]">
          GitKarma uses activity checks to keep profile rankings comparable.
        </p>
      </div>
    </main>
  );
};

export default BotDetected;
