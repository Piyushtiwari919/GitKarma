import { useEffect, useState } from "react";

interface RateLimitExceededProps {
  retryAfterSeconds: number;
  message: string;
  onReset: () => void;
}

const RateLimitExceeded = ({
  retryAfterSeconds,
  message,
  onReset,
}: RateLimitExceededProps) => {
  const [secondsRemaining, setSecondsRemaining] = useState(retryAfterSeconds);

  useEffect(() => {
    setSecondsRemaining(retryAfterSeconds);

    // No countdown needed for long penalties.
    if (retryAfterSeconds > 60) {
      return;
    }

    // Defensive case: retry is already available.
    if (retryAfterSeconds <= 0) {
      onReset();
      return;
    }

    const interval = window.setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [retryAfterSeconds, onReset]);

  // Automatically restore the search form when a short penalty expires.
  useEffect(() => {
    if (retryAfterSeconds <= 60 && secondsRemaining === 0) {
      onReset();
    }
  }, [secondsRemaining, retryAfterSeconds, onReset]);

  const formatLongDuration = (totalSeconds: number) => {
    const totalMinutes = Math.ceil(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours} hour${hours !== 1 ? "s" : ""} and ${minutes} minute${
        minutes !== 1 ? "s" : ""
      }`;
    }

    if (hours > 0) {
      return `${hours} hour${hours !== 1 ? "s" : ""}`;
    }

    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  };

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  };

  const isShortPenalty = retryAfterSeconds <= 60;

  return (
    <div className="mx-auto w-full max-w-lg rounded-lg border border-[#30363d] bg-[#161b22] p-6 text-center shadow-lg">
      {/* Icon */}
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#30363d] bg-[#0d1117]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7 text-[#f85149]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15 14" />
        </svg>
      </div>

      <h2 className="mt-4 text-xl font-semibold text-[#c9d1d9]">
        GitHub Rate Limit Reached
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8b949e]">
        {message}
      </p>

      {isShortPenalty ? (
        <>
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wider text-[#8b949e]">
              Try again in
            </p>

            <div className="mt-2 font-mono text-4xl font-bold tracking-tight text-[#58a6ff]">
              {formatCountdown(secondsRemaining)}
            </div>

            <p className="mt-2 text-xs text-[#6e7681]">
              This page will automatically become available when the timer
              expires.
            </p>
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-md border border-[#30363d] bg-[#0d1117] px-4 py-4">
          <p className="text-xs uppercase tracking-wider text-[#8b949e]">
            Estimated retry window
          </p>

          <p className="mt-2 text-lg font-semibold text-[#58a6ff]">
            Try again in approximately {formatLongDuration(retryAfterSeconds)}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex items-center justify-center rounded-md border border-[#30363d] bg-[#21262d] px-5 py-2.5 text-sm font-medium text-[#c9d1d9] transition-colors hover:bg-[#30363d] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#8250df] focus:ring-offset-2 focus:ring-offset-[#161b22]"
      >
        Try another username
      </button>
    </div>
  );
};

export default RateLimitExceeded;
