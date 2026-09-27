import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";

const getResponseMessage = (error: unknown): string | undefined => {
  if (!isRouteErrorResponse(error)) return undefined;

  const data: unknown = error.data;

  if (typeof data === "string" && data.trim()) {
    return data.trim().slice(0, 500);
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string" &&
    data.message.trim()
  ) {
    return data.message.trim().slice(0, 500);
  }

  return undefined;
};

const getDebugDetails = (error: unknown): string => {
  if (error instanceof globalThis.Error) {
    return error.stack ?? `${error.name}: ${error.message}`;
  }

  try {
    return JSON.stringify(error, null, 2) ?? String(error);
  } catch {
    return String(error);
  }
};

const ErrorPage = () => {
  const routeError = useRouteError();

  let title = "Something went wrong";
  let message =
    "An unexpected error occurred. Please try again or return home.";
  let errorCode = "APPLICATION ERROR";

  if (isRouteErrorResponse(routeError)) {
    errorCode = `HTTP ${routeError.status}`;

    switch (routeError.status) {
      case 404:
        title = "Page not found";
        message = "The page you're looking for doesn't exist or has moved.";
        break;

      case 401:
        title = "Unauthorized";
        message = "You're not authorized to access this page.";
        break;

      case 403:
        title = "Access denied";
        message = "You don't have permission to access this page.";
        break;

      case 429:
        title = "Too many requests";
        message = "Please wait a moment before trying again.";
        break;

      case 503:
        title = "Service unavailable";
        message =
          "This service is temporarily unavailable. Please try again shortly.";
        break;

      default:
        title = routeError.statusText || "Request failed";
        message =
          getResponseMessage(routeError) ??
          "The request could not be completed. Please try again.";
    }
  } else if (routeError instanceof globalThis.Error) {
    errorCode = "CLIENT ERROR";
  }

  if (import.meta.env.DEV) {
    console.error("GitKarma route error:", routeError);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0d1117] px-4 py-10 text-center">
      <section
        aria-labelledby="error-title"
        role="alert"
        className="w-full max-w-lg rounded-2xl border border-[#30363d] bg-[#161b22] p-7 shadow-xl sm:p-10"
      >
        {/* Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#f85149]/20 bg-[#f85149]/10 text-[#f85149]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7"
            aria-hidden="true"
          >
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.3 3.5 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.5a2 2 0 0 0-3.4 0Z" />
          </svg>
        </div>

        {/* Error code */}
        <p className="mt-6 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#f85149]">
          {errorCode}
        </p>

        {/* Title */}
        <h1
          id="error-title"
          className="mt-3 text-2xl font-bold tracking-tight text-[#f0f6fc] sm:text-3xl"
        >
          {title}
        </h1>

        {/* Description */}
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#8b949e]">
          {message}
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#238636] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2ea043] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3fb950] focus-visible:ring-offset-2 focus-visible:ring-offset-[#161b22]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="m3 10 9-7 9 7" />
              <path d="M5 9v12h14V9" />
              <path d="M9 21v-7h6v7" />
            </svg>
            Return home
          </Link>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#30363d] bg-transparent px-5 py-2.5 text-sm font-medium text-[#c9d1d9] transition-colors hover:border-[#484f58] hover:bg-[#21262d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8250df] focus-visible:ring-offset-2 focus-visible:ring-offset-[#161b22]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M20 7v5h-5" />
              <path d="M4 17v-5h5" />
              <path d="M5.6 9a7 7 0 0 1 11.6-2L20 12" />
              <path d="M18.4 15a7 7 0 0 1-11.6 2L4 12" />
            </svg>
            Reload page
          </button>
        </div>

        {/* Development-only details */}
        {import.meta.env.DEV && (
          <details className="mt-8 rounded-lg border border-[#30363d] bg-[#0d1117] text-left">
            <summary className="cursor-pointer px-4 py-3 text-xs font-medium text-[#8b949e] hover:text-[#c9d1d9]">
              Developer details
            </summary>

            <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words border-t border-[#30363d] p-4 font-mono text-xs leading-5 text-[#f85149]">
              {getDebugDetails(routeError)}
            </pre>
          </details>
        )}
      </section>
    </main>
  );
};

export default ErrorPage;
