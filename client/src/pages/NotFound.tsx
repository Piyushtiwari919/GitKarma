import { Link } from "react-router-dom";

interface NotFoundProps {
  username: string;
}

const NotFound = ({ username }: NotFoundProps) => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 text-center animate-fade-in">
      {/* 404 / Missing Icon */}
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#161b22] border border-[#30363d] text-gray-500 shadow-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="9" y1="9" x2="13" y2="13"></line>
          <line x1="13" y1="9" x2="9" y2="13"></line>
        </svg>
      </div>

      <h1 className="mb-2 text-3xl font-bold tracking-tight text-[#c9d1d9] sm:text-4xl">
        User Not Found
      </h1>

      <p className="mb-8 max-w-md text-base text-gray-400">
        We couldn't find any GitHub account matching{" "}
        <span className="font-semibold text-[#c9d1d9]">@{username}</span>.
        Please check the spelling and try again.
      </p>

      <Link
        to="/"
        className="inline-flex items-center justify-center rounded-md border border-[#30363d] bg-[#161b22] px-6 py-3 text-sm font-medium text-[#c9d1d9] shadow-sm transition-colors hover:bg-[#30363d] focus:outline-none focus:ring-2 focus:ring-[#8250df] focus:ring-offset-2 focus:ring-offset-[#0d1117]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Try Another Username
      </Link>
    </div>
  );
};

export default NotFound;
