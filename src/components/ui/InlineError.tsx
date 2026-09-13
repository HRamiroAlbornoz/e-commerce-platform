type InlineErrorProps = {
  message?: string | null | undefined;
};

export function InlineError({ message }: InlineErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p role="alert" className="font-body text-xs text-ink/80 dark:text-bone/80">
      {message}
    </p>
  );
}
