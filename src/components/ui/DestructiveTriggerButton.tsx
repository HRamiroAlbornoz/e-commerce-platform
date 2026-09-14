import type { ReactNode } from 'react';

type DestructiveTriggerButtonProps = {
  onClick: () => void;
  children: ReactNode;
};

export function DestructiveTriggerButton({ onClick, children }: DestructiveTriggerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-body border-b border-ink text-xs font-medium tracking-widest text-ink uppercase hover:border-field-magenta hover:text-field-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta dark:border-bone dark:text-bone dark:hover:border-field-cyan dark:hover:text-field-cyan dark:focus-visible:outline-field-cyan"
    >
      {children}
    </button>
  );
}
