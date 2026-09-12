type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-24 text-center">
      <p className="font-display text-2xl text-ink dark:text-bone">{title}</p>
      {description ? (
        <p className="font-body max-w-md text-sm text-ink/70 dark:text-bone/70">{description}</p>
      ) : null}
    </div>
  );
}
