interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorBanner({ message, onRetry, className = "" }: ErrorBannerProps) {
  return (
    <div
      className={`rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300 ${className}`}
    >
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-xs font-medium text-rose-200 underline hover:text-rose-100"
        >
          Retry
        </button>
      )}
    </div>
  );
}
