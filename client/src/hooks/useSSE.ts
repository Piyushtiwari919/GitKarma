import { useState, useCallback, useRef, useEffect } from "react";

export interface RejectionInfo {
  reason: string;
  message?: string;
}

export const useSSE = () => {
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<
    "idle" | "connecting" | "open" | "error" | "closed" | "rejected"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rejectionInfo, setRejectionInfo] = useState<RejectionInfo | null>(
    null,
  );

  const eventSourceRef = useRef<EventSource | null>(null);
  const isRejectedRef = useRef(false);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const connect = useCallback(
    (endpoint: string, onComplete: () => void) => {
      disconnect();
      isRejectedRef.current = false;
      setStatus("connecting");
      setErrorMessage(null);
      setRejectionInfo(null);
      setProgress(0);

      const es = new EventSource(endpoint);
      eventSourceRef.current = es;

      es.onopen = () => setStatus("open");

      es.addEventListener("progress", (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);

          // Handle bot/flagged rejection
          if (data?.step === "REJECTED") {
            isRejectedRef.current = true;
            setRejectionInfo({
              reason: data.reason || "ACCOUNT_REJECTED",
              message:
                data.message || "This account is not eligible for scoring.",
            });
            setStatus("rejected");
            disconnect();
            return;
          }

          // If numeric or standard object progress
          const rawProgress = typeof data === "object" ? data.progress : data;
          if (typeof rawProgress === "number") {
            setProgress(rawProgress);
          }
        } catch (err) {
          console.error("SSE Parse Error:", err);
        }
      });

      es.addEventListener("completed", () => {
        // Guard: If we rejected this run, DO NOT trigger onComplete / fetchFinalScore
        if (isRejectedRef.current) {
          disconnect();
          return;
        }

        setStatus("closed");
        disconnect();
        onComplete();
      });

      // 3. Update the error listener to capture the message
      es.addEventListener("error", (e: MessageEvent) => {
        try {
          const parsedData = JSON.parse(e.data);
          setErrorMessage(parsedData.error || "An unknown error occurred");
        } catch (err) {
          // Fallback if the backend sends a non-JSON string or native error
          setErrorMessage("Connection lost or server error");
        }
        setStatus("error");
        disconnect();
      });

      es.onerror = () => {
        setStatus("error");
        disconnect();
      };
    },
    [disconnect],
  );

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  // 4. Export the errorMessage
  return { progress, status, errorMessage, rejectionInfo, connect, disconnect };
};
