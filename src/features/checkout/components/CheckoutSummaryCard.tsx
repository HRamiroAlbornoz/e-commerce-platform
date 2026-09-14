import type { ReactNode } from 'react';

type CheckoutSummaryCardProps = {
  title: string;
  onEdit: () => void;
  children: ReactNode;
};

export function CheckoutSummaryCard({ title, onEdit, children }: CheckoutSummaryCardProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="font-display text-xl text-ink dark:text-bone">{title}</p>
        {children}
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="font-body text-xs font-medium tracking-widest text-ink uppercase underline decoration-1 underline-offset-2 hover:text-field-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta dark:text-bone dark:hover:text-field-cyan dark:focus-visible:outline-field-cyan"
      >
        Editar
      </button>
    </div>
  );
}
