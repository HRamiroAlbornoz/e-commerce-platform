import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
  loadingLabel?: string;
};

export const BUTTON_CLASSES =
  'font-body border border-current px-6 py-2 text-xs font-medium tracking-widest uppercase enabled:hover:border-field-magenta enabled:hover:text-field-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta disabled:cursor-not-allowed disabled:opacity-40 dark:enabled:hover:border-field-cyan dark:enabled:hover:text-field-cyan dark:focus-visible:outline-field-cyan';

export function Button({
  isLoading = false,
  loadingLabel = 'Enviando…',
  disabled,
  children,
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      className={BUTTON_CLASSES}
      {...buttonProps}
    >
      {isLoading ? loadingLabel : children}
    </button>
  );
}
