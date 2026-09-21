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
        className="text-gray-400"
      >{`> Initializing worker environment for @${username}...`}</span>,
    ];

    if (progress >= 25) {
      newLogs.push(
        <span key="25">
          {`> POST https://api.github.com/graphql `}
          <span className="text-[#2ea043]">[200 OK]</span>
        </span>,
      );
    }
    if (progress >= 50) {
      newLogs.push(
        <span key="50">
          {`> Parsing repository nodes & contribution graphs `}
          <span className="text-[#2ea043]">[SUCCESS]</span>
        </span>,
      );
    }
    if (progress >= 75) {
      newLogs.push(
        <span key="75">
          {`> Aggregating metrics -> `}
          <span className="text-[#8250df]">calculateGitHubScore()</span>
        </span>,
      );
    }
    if (progress >= 100) {
      newLogs.push(
        <span key="100">
          {`> Persisting to MongoDB & Redis Cache `}
          <span className="text-[#2ea043]">[DONE]</span>
        </span>,
      );
    }

    setLogs(newLogs);
  }, [progress, username]);

  return (
    <div className="w-full max-w-2xl mx-auto overflow-hidden rounded-xl border border-[#30363d] bg-[#0d1117] shadow-2xl">
      {/* Terminal Top Bar */}
      <div className="flex items-center gap-2 border-b border-[#30363d] bg-[#161b22] px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-[#ff5f56]"></div>
        <div className="h-3 w-3 rounded-full bg-[#ffbd2e]"></div>
        <div className="h-3 w-3 rounded-full bg-[#27c93f]"></div>
        <div className="ml-2 text-xs font-medium text-gray-500 font-mono">
          worker-thread-1 — bash — 80x24
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-6 font-mono text-sm sm:text-base text-[#c9d1d9] min-h-62.5 flex flex-col justify-between">
        {/* Logs */}
        <div className="flex flex-col gap-3">
          {logs.map((log, index) => (
            <div key={index} className="animate-fade-in text-left">
              {log}
            </div>
          ))}

          {/* Active processing line with blinking cursor */}
          {progress < 100 && (
            <div className="mt-2 flex items-center text-[#8250df]">
              <span>{`> Processing`}</span>
              <span className="animate-pulse ml-1">_</span>
            </div>
          )}
        </div>

        {/* Visual Progress Bar (Bottom of Terminal) */}
        <div className="mt-8">
          <div className="mb-2 flex justify-between text-xs text-gray-500">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#30363d]">
            <div
              className="h-full bg-linear-to-r from-[#8250df] to-[#2ea043] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTerminal;
