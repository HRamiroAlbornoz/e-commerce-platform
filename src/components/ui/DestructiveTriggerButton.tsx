import type { ReactNode } from 'react';

export const TEXT_ACTION_BUTTON_CLASSES =
  'font-body border-b border-ink text-xs font-medium tracking-widest text-ink uppercase hover:border-field-magenta hover:text-field-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta disabled:cursor-not-allowed disabled:opacity-40 dark:border-bone dark:text-bone dark:hover:border-field-cyan dark:hover:text-field-cyan dark:focus-visible:outline-field-cyan';

type DestructiveTriggerButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
};

export function DestructiveTriggerButton({
  onClick,
  disabled = false,
  children,
}: DestructiveTriggerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={TEXT_ACTION_BUTTON_CLASSES}
    >
      {children}
    </button>
  );
}
