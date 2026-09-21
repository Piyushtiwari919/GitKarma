import { useState, useCallback, useRef, useEffect } from "react";

export const useSSE = () => {
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<
    "idle" | "connecting" | "open" | "error" | "closed"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const connect = useCallback(
    (endpoint: string, onComplete: () => void) => {
      disconnect();
      setStatus("connecting");
      setErrorMessage(null); // 2. Reset error on new connection

      const es = new EventSource(endpoint);
      eventSourceRef.current = es;

      es.onopen = () => setStatus("open");

      es.addEventListener("progress", (e: MessageEvent) => {
        try {
          //console.log(e);
          //console.log(e.data);
          const data = JSON.parse(e.data);
          if (data?.step === "REJECTED") {
            if (data?.reason === "BOT_DETECTED") {
              // Do Something: TODO
            }
          }
          setProgress(Number(data?.progress || data));
        } catch (err) {
          console.error("SSE Parse Error:", err);
        }
      });

      es.addEventListener("completed", () => {
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
  return { progress, status, errorMessage, connect, disconnect };
};
