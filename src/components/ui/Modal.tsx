import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type ModalProps = {
  title: string;
  onClose: () => void;
  closeDisabled?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  children: ReactNode;
};

export function Modal({
  title,
  onClose,
  closeDisabled = false,
  initialFocusRef,
  children,
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const latestRef = useRef({ onClose, closeDisabled });

  useEffect(() => {
    latestRef.current = { onClose, closeDisabled };
  });

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const focusTarget = initialFocusRef?.current ?? panelRef.current;
    focusTarget?.focus();

    return () => {
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [initialFocusRef]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (latestRef.current.closeDisabled) {
        return;
      }

      if (event.key === 'Escape') {
        latestRef.current.onClose();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) {
        return;
      }

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center px-4">
      <button
        type="button"
        onClick={onClose}
        disabled={closeDisabled}
        aria-label="Cerrar"
        className="absolute inset-0 bg-ink/60 disabled:cursor-not-allowed"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex w-full max-w-md flex-col gap-4 border border-ink/15 bg-bone p-6 text-ink outline-none dark:border-bone/15 dark:bg-ink dark:text-bone"
      >
        <h2 id={titleId} className="font-display text-xl">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
