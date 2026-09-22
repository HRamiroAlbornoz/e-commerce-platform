import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  forgotPasswordFormSchema,
  type ForgotPasswordFormValues,
} from '@/features/auth/schemas/authForms';
import { requestPasswordReset } from '@/features/auth/services/requestPasswordReset';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { InlineError } from '@/components/ui/InlineError';

type ForgotPasswordFormProps = {
  onBackToLogin: () => void;
};

const BACK_TO_LOGIN_CLASSES =
  'font-body self-start text-xs text-ink/70 underline decoration-1 underline-offset-2 hover:text-field-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta dark:text-bone/70 dark:hover:text-field-cyan dark:focus-visible:outline-field-cyan';

export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [wasSent, setWasSent] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    mode: 'onTouched',
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    const result = await requestPasswordReset(values.email);

    if (result.ok) {
      setWasSent(true);
      return;
    }

    setError('root', { message: result.message });
  }

  return (
    <div className="flex flex-col gap-4">
      {wasSent ? (
        <p className="font-body text-sm text-ink/70 dark:text-bone/70">
          Si existe una cuenta con ese email, te enviamos un correo para restablecer la contraseña.
        </p>
      ) : (
        <form
          onSubmit={(event) => void handleSubmit(onSubmit)(event)}
          noValidate
          className="flex flex-col gap-4"
        >
          <p className="font-body text-sm text-ink/70 dark:text-bone/70">
            Ingresá tu email y te enviamos un enlace para restablecer la contraseña.
          </p>
          <fieldset disabled={isSubmitting} className="contents">
            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <InlineError message={errors.root?.message} />
            <Button type="submit" isLoading={isSubmitting}>
              Enviar enlace
            </Button>
          </fieldset>
        </form>
      )}
      <button type="button" onClick={onBackToLogin} className={BACK_TO_LOGIN_CLASSES}>
        Volver a iniciar sesión
      </button>
    </div>
  );
}
