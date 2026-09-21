import { useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { useSSE } from "../hooks/useSSE";
import { setUserData } from "../store/slices/scoreSlice.js";
import ProgressTerminal from "../components/score/ProgressTerminal.tsx";
import ScoreDashboard from "../components/score/ScoreDashboard.tsx";
import NotFound from "./NotFound.tsx";
const Result = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Assuming your slice stores data in state.score.userData
  const userData = useSelector((state: any) => state.score?.userData);

  const { progress, status, errorMessage, connect } = useSSE();

  // Function to fetch the final payload once BullMQ is done
  const fetchFinalScore = useCallback(async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/getInfo`,
        { username },
      );

      if (response.status === 200) {
        dispatch(setUserData(response.data.data));
      } else {
        // If it somehow returns 202 again, the worker failed.
        console.error("Worker did not finish properly");
        navigate("/");
      }
    } catch (error) {
      console.error("Failed to fetch final data", error);
      navigate("/");
    }
  }, [username, dispatch, navigate]);

  useEffect(() => {
    if (!username) return;

    // 1. If data is already in Redux for this user, do nothing (Cache Hit from Home)
    if (userData && userData.username === username) {
      return;
    }

    // 2. Otherwise, connect to SSE using the exact jobId format your backend uses
    const jobId = `user-${username}`;
    const sseEndpoint = `${import.meta.env.VITE_BACKEND_URL}/api/user/progress/${jobId}`;

    // Pass fetchFinalScore as the onComplete callback
    connect(sseEndpoint, fetchFinalScore);
  }, [username, userData, connect, fetchFinalScore]);

  // --- RENDERING LOGIC ---

  if (status === "error") {
    // Check if the backend specifically told us the user wasn't found
    const isUserNotFound = errorMessage?.toLowerCase().includes("not found");

    if (isUserNotFound) {
      return (
        <main className="flex bg-[#0d1117] flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
          <NotFound username={username || "User"} />
        </main>
      );
    }

    // Fallback: Generic Server/Network Error
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center text-white bg-[#0d1117]">
        <h2 className="text-2xl text-red-500 mb-4 font-bold">
          Connection Lost
        </h2>
        <p className="text-gray-400 mb-6 text-center max-w-md">
          {errorMessage ||
            "We lost connection to the worker calculating your score."}
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-[#2ea043] px-6 py-2 rounded-md font-medium text-white transition-colors hover:bg-[#2c974b]"
        >
          Try Again
        </button>
      </div>
    );
  }

  // If Redux has the data, render the final dashboard
  if (userData && userData.username === username) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] flex-col bg-[#0d1117] px-4 sm:px-6 lg:px-8">
        <ScoreDashboard userData={userData} />
      </main>
    );
  }

  // Otherwise, we are calculating. Show the Terminal!
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-[#0d1117] p-4 sm:p-8">
      <div className="w-full text-center mb-8">
        <h2 className="text-2xl font-bold text-[#c9d1d9] sm:text-3xl">
          Analyzing Profile
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          Hold tight while our worker calculates your score.
        </p>
      </div>
      <ProgressTerminal progress={progress} username={username} />
    </main>
  );
};

export default Result;
