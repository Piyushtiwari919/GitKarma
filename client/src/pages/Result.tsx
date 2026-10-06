import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { useSSE } from "../hooks/useSSE";
import { setUserData } from "../store/slices/scoreSlice.js";
import ProgressTerminal from "../components/score/ProgressTerminal.tsx";
import ScoreDashboard from "../components/score/ScoreDashboard.tsx";
import BotDetected from "../components/bot/BotDetected.tsx";
import NotFound from "./NotFound.tsx";

const Result = () => {
  const { username: rawUsername } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Normalize route param to lowercase
  const username = useMemo(
    () => rawUsername?.trim().toLowerCase() || "",
    [rawUsername],
  );

  // Redux data source
  const reduxUserData = useSelector((state: any) => state.score?.userData);

  // Local state fallback to guarantee immediate UI rendering upon API 200 response
  const [localUserData, setLocalUserData] = useState(null);

  // Active user data: prefer local state, fallback to Redux
  const activeUserData = localUserData || reduxUserData;

  const { progress, status, errorMessage, rejectionInfo, connect } = useSSE();

  // Fetch final score from API
  const fetchFinalScore = useCallback(async () => {
    if (!username) return;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/getInfo`,
        { username },
      );

      if (response.status === 200 && response.data?.data) {
        const payload = response.data.data;

        // Update both local state and Redux store
        setLocalUserData(payload);
        dispatch(setUserData(payload));
      }
    } catch (error) {
      console.error("Failed to fetch final user data:", error);
    }
  }, [username, dispatch]);

  useEffect(() => {
    if (!username) return;

    // Check if data is already available and matching (case-insensitive)
    const isMatchingDataLoaded =
      activeUserData &&
      activeUserData.username?.toLowerCase() === username.trim().toLowerCase();

    if (isMatchingDataLoaded) {
      return;
    }

    // Cache-first validation: verify if job is already complete before opening SSE
    const checkCacheOrConnectSSE = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/getInfo`,
          { username },
        );

        if (response.status === 200 && response.data?.data) {
          const payload = response.data.data;

          setLocalUserData(payload);
          dispatch(setUserData(payload));

          return;
        }

        // Job is still processing (202): connect to SSE stream
        if (response.status === 202) {
          const jobId = `user-${username}`;

          const sseEndpoint = `${import.meta.env.VITE_BACKEND_URL}/api/user/progress/${jobId}`;

          connect(sseEndpoint, fetchFinalScore);
        }
      } catch (err) {
        console.error("Initial cache verification failed:", err);

        // Fallback: attempt SSE connection directly
        const jobId = `user-${username}`;

        const sseEndpoint = `${import.meta.env.VITE_BACKEND_URL}/api/user/progress/${jobId}`;

        connect(sseEndpoint, fetchFinalScore);
      }
    };

    checkCacheOrConnectSSE();
  }, [username, activeUserData, connect, fetchFinalScore, dispatch]);

  // --- RENDERING PIPELINE ---

  // 1. Account Rejection
  if (status === "rejected") {
    return <BotDetected username={username} rejectionData={rejectionInfo} />;
  }

  // 2. Server or Network Failure
  if (status === "error") {
    const isUserNotFound = errorMessage?.toLowerCase().includes("not found");

    if (isUserNotFound) {
      return <NotFound username={username} />;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-6">
        <div className="w-full max-w-md rounded-xl border border-white/10 bg-zinc-900 p-8 text-center">
          <h1 className="mb-3 text-2xl font-semibold text-white">
            Connection Lost
          </h1>

          <p className="mb-6 text-sm text-zinc-400">
            {errorMessage ||
              "We lost connection to the worker calculating your score."}
          </p>

          <button
            onClick={() => navigate("/")}
            className="rounded-md bg-[#2ea043] px-6 py-2 font-medium text-white transition-colors hover:bg-[#2c974b]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // 3. Render Dashboard when data is present (case-insensitive check)
  const isDataReady =
    activeUserData &&
    activeUserData.username?.toLowerCase() === username.toLowerCase();

  if (isDataReady) {
    return <ScoreDashboard userData={activeUserData} />;
  }

  // 4. Processing / Calculating Terminal
  return <ProgressTerminal progress={progress} username={username} />;
};

export default Result;
