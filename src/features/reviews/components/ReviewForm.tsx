import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { User } from 'firebase/auth';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { InlineError } from '@/components/ui/InlineError';
import { RatingInput } from '@/features/reviews/components/RatingInput';
import { saveReview } from '@/features/reviews/services/saveReview';
import { reviewInputSchema, type Review, type ReviewInput } from '@shared/schemas/review';
import type { SubmitState } from '@/lib/asyncSubmitState';

type ReviewFormProps = {
  productId: string;
  user: User;
  existingReview: Review | null;
  onSaved: () => void;
};

export function ReviewForm({ productId, user, existingReview, onSaved }: ReviewFormProps) {
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' });
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewInputSchema),
    mode: 'onTouched',
    defaultValues: existingReview
      ? { rating: existingReview.rating, comment: existingReview.comment }
      : { comment: '' },
  });

  const isBusy = isSubmitting || submitState.status === 'submitting';

  async function handleValid(values: ReviewInput): Promise<void> {
    setSubmitState({ status: 'submitting' });

    try {
      await saveReview(user, productId, values, existingReview?.createdAt);
    } catch {
      setSubmitState({
        status: 'error',
        message: 'No pudimos guardar tu reseña. Intentá de nuevo.',
      });
      return;
    }

    setSubmitState({ status: 'idle' });
    onSaved();
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(handleValid)(event)}
      noValidate
      className="flex flex-col gap-4"
    >
      <fieldset disabled={isBusy} className="contents">
        <legend className="font-display text-xl text-ink dark:text-bone">
          {existingReview ? 'Editá tu reseña' : 'Dejá tu reseña'}
        </legend>

        <div className="flex flex-col gap-1">
          <span className="font-body text-xs font-medium tracking-widest text-ink uppercase dark:text-bone">
            Calificación
          </span>
          <RatingInput control={control} />
          <InlineError message={errors.rating?.message} />
        </div>

        <Textarea
          label="Comentario"
          rows={4}
          maxLength={500}
          error={errors.comment?.message}
          {...register('comment')}
        />

        <div aria-live="polite">
          <InlineError message={submitState.status === 'error' ? submitState.message : null} />
        </div>

        <div>
          <Button type="submit" isLoading={isBusy} loadingLabel="Guardando…">
            {existingReview ? 'Actualizar reseña' : 'Publicar reseña'}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
