import { useId } from 'react';
import type { ChangeEvent } from 'react';
import type { ImageUploadState } from '@/features/admin/uploads/hooks/useImageUpload';
import { InlineError } from '@/components/ui/InlineError';
import { FIELD_LABEL_CLASSES } from '@/features/admin/products/constants/formFieldClasses';

const FILE_INPUT_CLASSES =
  'font-body text-sm text-ink file:mr-4 file:border file:border-current file:bg-transparent file:px-3 file:py-1.5 file:font-body file:text-xs file:font-medium file:tracking-widest file:uppercase disabled:cursor-not-allowed disabled:opacity-40 enabled:file:hover:border-field-magenta enabled:file:hover:text-field-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta dark:text-bone dark:enabled:file:hover:border-field-cyan dark:enabled:file:hover:text-field-cyan dark:focus-visible:outline-field-cyan';

type ImageUploadFieldProps = {
  currentImageUrl: string;
  state: ImageUploadState;
  onFileSelected: (file: File) => void;
  error: string | undefined;
};

export function ImageUploadField({
  currentImageUrl,
  state,
  onFileSelected,
  error,
}: ImageUploadFieldProps) {
  const inputId = useId();

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) {
      onFileSelected(file);
    }
  }

  const previewUrl = state.status === 'success' ? state.publicUrl : currentImageUrl;
  const isBusy = state.status === 'requesting-url' || state.status === 'uploading';

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className={FIELD_LABEL_CLASSES}>
        Imagen
      </label>

      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Vista previa de la imagen del producto"
          className="h-32 w-32 border border-ink/15 object-cover dark:border-bone/15"
        />
      ) : null}

      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={isBusy}
        className={FILE_INPUT_CLASSES}
      />

      {state.status === 'requesting-url' ? (
        <p className="font-body text-xs text-ink/60 dark:text-bone/60">Preparando la subida…</p>
      ) : null}

      {state.status === 'uploading' ? (
        <div
          role="progressbar"
          aria-valuenow={state.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progreso de la subida"
          className="h-1 w-full bg-ink/10 dark:bg-bone/10"
        >
          <div
            className="h-full bg-field-magenta dark:bg-field-cyan"
            style={{ width: `${state.progress}%` }}
          />
        </div>
      ) : null}

      <div aria-live="polite">
        <InlineError message={state.status === 'error' ? state.message : (error ?? null)} />
      </div>
    </div>
  );
}
