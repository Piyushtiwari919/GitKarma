const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[#30363d] bg-[#0d1117]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Left Side: Copyright & Maker */}
          <div className="text-sm text-gray-500 text-center sm:text-left">
            © {currentYear} GitKarma. Built by{" "}
            <a
              href="https://github.com/PiyushTiwari919"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#c9d1d9] transition-colors hover:text-[#8250df] focus:outline-none focus:underline"
            >
              Piyush Tiwari
            </a>
            .
          </div>

          {/* Right Side: Disclaimer & Source */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-sm text-gray-500">
            <span className="text-xs sm:text-sm">
              Not affiliated with GitHub.
            </span>

            <a
              href="https://github.com/PiyushTiwari919/GitKarma"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#c9d1d9] transition-colors hover:text-[#8250df] focus:outline-none focus:underline"
            >
              Source Code
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
