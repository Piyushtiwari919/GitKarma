import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";

const Error = () => {
  // 1. Capture the error thrown by the router or frontend crash
  const error = useRouteError();

  // 2. Set up default state for a generic frontend crash
  let title = "Something went wrong";
  let message =
    "An unexpected application error occurred. Our team has been notified.";
  let errorCode = "500 / CRASH";

  // 3. Intelligently parse the error based on its type
  if (isRouteErrorResponse(error)) {
    // This handles thrown HTTP responses (404, 401, 503)
    errorCode = error.status.toString();

    if (error.status === 404) {
      title = "Page Not Found";
      message = "The page you are looking for doesn't exist or has been moved.";
    } else if (error.status === 401) {
      title = "Unauthorized";
      message = "You don't have permission to view this page.";
    } else if (error.status === 503) {
      title = "Service Unavailable";
      message =
        "The GitKarma backend is currently down for maintenance. Please try again later.";
    } else {
      title = error.statusText || "Oops!";
      message = error.data?.message || "An unexpected network error occurred.";
    }
  } else if (error instanceof Error) {
    // This handles pure JavaScript crashes (e.g., TypeError)
    message = error.message;
  }

  // Log to console for debugging (in production, send this to Sentry/Datadog)
  console.error("GitKarma Global Error:", error);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0d1117] p-4 text-center px-4 sm:px-6 lg:px-8">
      {/* Visual Error Indicator */}
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-[#30363d] bg-[#161b22] text-[#ff5f56] shadow-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>

      {/* Error Code & Title */}
      <p className="text-sm font-semibold tracking-widest text-[#ff5f56] uppercase">
        Error {errorCode}
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#c9d1d9] sm:text-5xl">
        {title}
      </h1>

      {/* Error Details */}
      <p className="mt-4 max-w-lg text-base text-gray-400 sm:text-lg">
        {message}
      </p>

      {/* Redirection / Escape Hatch */}
      <div className="mt-10 flex gap-4">
        {/* We use a hard anchor tag for reloading the page if the crash corrupted React state */}
        <button
          onClick={() => (window.location.href = "/")}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-[#2ea043] px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-[#2c974b] focus:outline-none focus:ring-2 focus:ring-[#2ea043] focus:ring-offset-2 focus:ring-offset-[#0d1117]"
        >
          Return to Home
        </button>

        {/* Back button option for minor routing errors */}
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center justify-center rounded-md border border-[#30363d] bg-transparent px-6 py-3 text-base font-medium text-[#c9d1d9] transition-colors hover:bg-[#161b22] focus:outline-none focus:ring-2 focus:ring-[#8250df] focus:ring-offset-2 focus:ring-offset-[#0d1117]"
        >
          Go Back
        </button>
      </div>

      {/* Optional: Developer tip for local environments */}
      {import.meta.env.NODE_ENV === "development" && (
        <div className="mt-12 max-w-2xl overflow-auto rounded-md bg-[#161b22] p-4 text-left border border-[#30363d]">
          <p className="text-xs font-mono text-red-400">
            [Dev Only] Exception Details:
          </p>
          <pre className="mt-2 text-xs text-gray-400 whitespace-pre-wrap font-mono">
            {error instanceof Error
              ? error.stack
              : JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
};

export default Error;
