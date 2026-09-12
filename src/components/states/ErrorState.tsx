type ErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 px-6 py-24 text-center"
    >
      <p className="font-display text-2xl text-ink dark:text-bone">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="font-body border-b-2 border-ink text-sm font-medium tracking-wide uppercase text-ink outline-offset-4 hover:border-field-magenta hover:text-field-magenta focus-visible:outline-2 focus-visible:outline-field-magenta dark:border-bone dark:text-bone dark:hover:border-field-cyan dark:hover:text-field-cyan dark:focus-visible:outline-field-cyan"
      >
        Reintentar
      </button>
    </div>
  );
}
