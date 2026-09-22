import { useRef, useState, type ReactNode } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { InlineError } from '@/components/ui/InlineError';
import type { SubmitState } from '@/lib/asyncSubmitState';

type ConfirmActionModalProps = {
  title: string;
  body: ReactNode;
  confirmLabel: string;
  loadingLabel: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
  onConfirmed: () => void;
};

export function ConfirmActionModal({
  title,
  body,
  confirmLabel,
  loadingLabel,
  onConfirm,
  onClose,
  onConfirmed,
}: ConfirmActionModalProps) {
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' });
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const isSubmitting = submitState.status === 'submitting';

  async function handleConfirm(): Promise<void> {
    setSubmitState({ status: 'submitting' });

    try {
      await onConfirm();
    } catch (err) {
      setSubmitState({
        status: 'error',
        message:
          err instanceof Error ? err.message : 'Ocurrió un error inesperado. Intenta de nuevo.',
      });
      return;
    }

    onConfirmed();
  }

  return (
    <Modal
      title={title}
      onClose={onClose}
      closeDisabled={isSubmitting}
      initialFocusRef={backButtonRef}
    >
      <div className="font-body text-sm text-ink/80 dark:text-bone/80">{body}</div>

      <div aria-live="polite">
        <InlineError message={submitState.status === 'error' ? submitState.message : null} />
      </div>

      <div className="flex flex-wrap justify-end gap-4">
        <button
          ref={backButtonRef}
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="font-body border-b border-transparent text-xs font-medium tracking-widest text-ink uppercase hover:border-field-magenta hover:text-field-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta disabled:cursor-not-allowed disabled:opacity-40 dark:text-bone dark:hover:border-field-cyan dark:hover:text-field-cyan dark:focus-visible:outline-field-cyan"
        >
          Volver
        </button>
        <Button
          onClick={() => void handleConfirm()}
          disabled={isSubmitting}
          isLoading={isSubmitting}
          loadingLabel={loadingLabel}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
