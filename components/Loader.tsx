export default function Loader({
  colorClass = "text-[#E50914]",
  fullScreen = false,
}: {
  colorClass?: string;
  fullScreen?: boolean;
}) {
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    fullScreen ? (
      <div className="grid min-h-screen place-items-center">{children}</div>
    ) : (
      <span className="inline-flex items-center justify-center">{children}</span>
    );

  return (
    <Wrapper>
      <svg
        role="status"
        className={`h-6 w-6 animate-spin ${colorClass}`}
        viewBox="0 0 24 24"
        fill="none"
        aria-label="loading"
      >
        <circle
          className="opacity-20"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-90"
          fill="currentColor"
          d="M22 12a10 10 0 0 0-10-10v4a6 6 0 0 1 6 6h4z"
        />
      </svg>
    </Wrapper>
  );
}
