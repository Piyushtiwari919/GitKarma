import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { extractGithubUsername } from "../utils/githubUtils.js";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../store/slices/scoreSlice.js";
import RateLimitExceeded from "../components/common/RateLimitExceeded.js";

interface RateLimitData {
  retryAfterSeconds: number;
  message: string;
}

const Home = () => {
  const [username, setUsername] = useState("");
  const [toast, setToast] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [rateLimitData, setRateLimitData] = useState<RateLimitData | null>(
    null,
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const showToast = (text: string) => {
    setMessage(text);
    setToast(true);

    setTimeout(() => {
      setToast(false);
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      showToast("❌ Username should not be empty");
      return;
    }

    const githubUsername = extractGithubUsername(trimmedUsername);

    if (!githubUsername) {
      showToast("❌ Please enter a valid GitHub username or URL");
      return;
    }

    const sendUsername = async () => {
      try {
        setIsLoading(true);

        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/getInfo`,
          {
            username: githubUsername,
          },
        );

        if (response.status === 202) {
          showToast("✅ Worker is active");
          setTimeout(() => {
            // Pass a flag telling Result.tsx to skip the initial API check
            navigate(`/score/${githubUsername}`, {
              state: { jobAlreadyStarted: true },
            });
          }, 100);
          return;
        }

        /*
         * If the score is already available immediately.
         */
        dispatch(setUserData(response.data.data));

        showToast("✅ Your score is displayed");

        setTimeout(() => {
          navigate(`/score/${githubUsername}`);
        }, 100);
      } catch (error) {
        console.error("Failed to fetch GitHub user data:", error);

        if (axios.isAxiosError(error)) {
          const statusCode = error.response?.status;

          const errorMessage =
            error.response?.data?.message ||
            "❌ Failed to fetch GitHub user data";

          /*
           * ------------------------------------------------
           * 429 → Show dedicated rate-limit UI
           * ------------------------------------------------
           */
          if (statusCode === 429) {
            const rawRetryAfter = error.response?.data?.retryAfterSeconds;

            const parsedRetryAfter = Number(rawRetryAfter);

            const retryAfterSeconds =
              Number.isFinite(parsedRetryAfter) && parsedRetryAfter >= 0
                ? Math.ceil(parsedRetryAfter)
                : 60;

            setRateLimitData({
              retryAfterSeconds,
              message: errorMessage,
            });

            return;
          }
          showToast(`❌ ${errorMessage}`);
          return;
        }

        /*
         * Non-Axios errors → generic toast
         */
        showToast("❌ Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    sendUsername();

    console.log("Submitting username:", trimmedUsername);
  };

  const handleRateLimitReset = () => {
    setRateLimitData(null);
    setIsLoading(false);
  };

  return (
    <>
      {/* Toast */}
      {toast && (
        <div
          role="alert"
          className="fixed right-4 top-20 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-zinc-700/80 bg-zinc-900/95 px-4 py-3 text-sm text-zinc-200 shadow-2xl shadow-black/40 backdrop-blur-xl sm:right-6"
        >
          <span className="leading-5">{message}</span>
        </div>
      )}

      <main className="relative isolate flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden bg-[#09090b] px-4 py-16 text-zinc-100 sm:px-6 lg:px-8">
        {/* Ambient lighting */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[42%] -z-10 h-112 w-[min(90vw,48rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/15 blur-[120px]"
        />

        {/* Subtle secondary glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-40 w-[min(80vw,40rem)] -translate-x-1/2 rounded-full bg-indigo-500/6 blur-[90px]"
        />

        {/* Hero */}
        <section className="w-full max-w-3xl text-center">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-zinc-800/90 bg-zinc-900/60 px-3.5 py-1.5 shadow-sm shadow-black/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]" />
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-400 sm:text-[11px]">
              Open-source profile insights
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tighter text-zinc-50 sm:text-6xl lg:text-7xl">
            Discover Your
            <br />
            <span className="bg-linear-to-r from-purple-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              GitKarma
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base sm:leading-8">
            Analyze your open-source contributions, commit history, and
            repositories to generate your comprehensive developer score.
          </p>
        </section>

        {/* Search / Rate Limit */}
        <section className="mt-10 w-full max-w-xl sm:mt-12">
          {rateLimitData ? (
            <div className="mx-auto w-full">
              <RateLimitExceeded
                retryAfterSeconds={rateLimitData.retryAfterSeconds}
                message={rateLimitData.message}
                onReset={handleRateLimitReset}
              />
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="group flex w-full flex-col gap-2 rounded-2xl border border-zinc-800/90 bg-zinc-900/50 p-2 shadow-2xl shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700 focus-within:border-purple-400/50 focus-within:ring-4 focus-within:ring-purple-500/10 focus-within:shadow-[0_0_40px_rgba(139,92,246,0.12)] sm:flex-row sm:items-center"
            >
              {/* Input */}
              <div className="relative min-w-0 flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500 transition-colors duration-200 group-focus-within:text-purple-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5-.28-1.15-.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                </div>

                <input
                  type="text"
                  name="username"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter GitHub username or URL"
                  aria-label="GitHub username or profile URL"
                  className="block h-12 w-full rounded-xl border-0 bg-transparent py-3 pl-12 pr-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
                  autoComplete="off"
                  disabled={isLoading}
                  spellCheck="false"
                />
              </div>

              {/* Calculate button */}
              <button
                type="submit"
                disabled={!username.trim() || isLoading}
                className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-white/80 bg-white px-6 text-sm font-semibold text-zinc-950 shadow-[0_0_24px_rgba(255,255,255,0.10)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-100 hover:shadow-[0_0_32px_rgba(255,255,255,0.18)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0 sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin motion-reduce:animate-none"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="opacity-90"
                        fill="currentColor"
                        d="M12 2a10 10 0 0 0-10 10h3a7 7 0 0 1 7-7V2z"
                      />
                    </svg>
                    <span>Calculating</span>
                  </>
                ) : (
                  <>
                    <span>Calculate</span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14" />
                      <path d="m13 6 6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}
        </section>

        {/* Supporting detail */}
        {!rateLimitData && (
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m9 12 2 2 4-4"
              />
            </svg>
            <span>Requires a public GitHub profile</span>
          </div>
        )}
      </main>
    </>
  );
};

export default Home;
