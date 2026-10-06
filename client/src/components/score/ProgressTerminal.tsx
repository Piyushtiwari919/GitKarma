import { useEffect, useState } from "react";

interface ProgressTerminalProps {
  progress: number;
  username?: string;
}

const ProgressTerminal = ({
  progress,
  username = "user",
}: ProgressTerminalProps) => {
  const [logs, setLogs] = useState<React.ReactNode[]>([]);

  // Map the exact progress numbers from your BullMQ worker to terminal output
  useEffect(() => {
    const newLogs: React.ReactNode[] = [
      <span
        key="0"
        className="text-[#8b949e]"
      >{`> Initializing worker environment for @${username}...`}</span>,
    ];

    if (progress >= 25) {
      newLogs.push(
        <span key="25">
          {`> POST https://api.github.com/graphql `}
          <span className="text-[#3fb950]">[200 OK]</span>
        </span>,
      );
    }

    if (progress >= 50) {
      newLogs.push(
        <span key="50">
          {`> Parsing repository nodes & contribution graphs `}
          <span className="text-[#3fb950]">[SUCCESS]</span>
        </span>,
      );
    }

    if (progress >= 75) {
      newLogs.push(
        <span key="75">
          {`> Aggregating metrics -> `}
          <span className="text-[#a371f7]">calculateGitHubScore()</span>
        </span>,
      );
    }

    if (progress >= 100) {
      newLogs.push(
        <span key="100">
          {`> Persisting to MongoDB & Redis Cache `}
          <span className="text-[#3fb950]">[DONE]</span>
        </span>,
      );
    }

    setLogs(newLogs);
  }, [progress, username]);

  return (
    <div className="min-h-screen w-full bg-[#0b0f14] px-4 py-8">
      <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-xl border border-[#30363d] bg-[#0d1117] shadow-2xl">
        {/* Terminal Top Bar */}
        <div className="flex items-center gap-2 border-b border-[#30363d] bg-[#161b22] px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <div className="h-3 w-3 rounded-full bg-[#27c93f]" />

          <div className="ml-2 font-mono text-xs font-medium text-[#6e7681]">
            worker-thread-1 — bash — 80x24
          </div>
        </div>

        {/* Terminal Body */}
        <div className="flex min-h-62.5 flex-col justify-between p-6 font-mono text-sm text-[#c9d1d9] sm:text-base">
          {/* Logs */}
          <div className="flex flex-col gap-3">
            {logs.map((log, index) => (
              <div key={index} className="animate-fade-in text-left">
                {log}
              </div>
            ))}

            {/* Active processing line with blinking cursor */}
            {progress < 100 && (
              <div className="mt-2 flex items-center text-[#a371f7]">
                <span>{`> Processing`}</span>

                <span className="ml-1 animate-pulse">_</span>
              </div>
            )}
          </div>

          {/* Visual Progress Bar (Bottom of Terminal) */}
          <div className="mt-8">
            <div className="mb-2 flex justify-between text-xs text-[#8b949e]">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#30363d]">
              <div
                className="h-full bg-linear-to-r from-[#8250df] to-[#2ea043] transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min(100, Math.max(0, progress))}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTerminal;
