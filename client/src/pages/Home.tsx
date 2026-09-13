import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { extractGithubUsername } from "../utils/githubUtils.js";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../store/slices/scoreSlice.js";

const Home = () => {
  const [username, setUsername] = useState("");
  const [toast, setToast] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

          navigate(`/score/${githubUsername}`);
          return;
        }

        dispatch(setUserData(response.data.data));
        navigate(`/score/${githubUsername}`);

        showToast("✅ Your score is displayed");
      } catch (error) {
        console.error("Failed to fetch GitHub user data:", error);

        if (axios.isAxiosError(error)) {
          const errorMessage =
            error.response?.data?.message ||
            "❌ Failed to fetch GitHub user data";

          showToast(errorMessage);
        } else {
          showToast("❌ Something went wrong. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    sendUsername();
    console.log("Submitting username:", trimmedUsername);
  };

  return (
    <>
      {toast && (
        <div className="fixed right-5 top-20 z-50 rounded-md border border-[#30363d] bg-[#161b22] px-4 py-3 text-sm text-[#c9d1d9] shadow-lg">
          {message}
        </div>
      )}
      <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-[#0d1117] px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#c9d1d9] sm:text-5xl lg:text-6xl">
            Discover Your <span className="text-[#8250df]">GitKarma</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400 sm:mt-6">
            Analyze your open-source contributions, commit history, and
            repositories to generate your comprehensive developer score.
          </p>
        </div>

        {/* Input Form */}
        <div className="mt-10 w-full max-w-md sm:max-w-lg">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              {/* GitHub '@' icon / placeholder visual */}
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </div>

              <input
                type="text"
                name="username"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter GitHub username"
                className="block w-full rounded-md border border-[#30363d] bg-[#161b22] py-3 pl-10 pr-3 text-[#c9d1d9] placeholder-gray-500 shadow-sm transition-colors focus:border-[#8250df] focus:outline-none focus:ring-1 focus:ring-[#8250df] sm:text-base"
                autoComplete="off"
                disabled={isLoading}
                spellCheck="false"
              />
            </div>

            <button
              type="submit"
              disabled={!username.trim() || isLoading}
              className="flex w-full items-center justify-center hover:cursor-pointer rounded-md border border-transparent bg-[#2ea043] px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-[#2c974b] focus:outline-none focus:ring-2 focus:ring-[#2ea043] focus:ring-offset-2 focus:ring-offset-[#0d1117] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isLoading ? "Calculating..." : "Calculate"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Requires a public GitHub profile.
        </p>
      </main>
    </>
  );
};

export default Home;
