import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginFormSchema, type LoginFormValues } from '@/features/auth/schemas/authForms';
import { loginWithEmail } from '@/features/auth/services/loginWithEmail';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { InlineError } from '@/components/ui/InlineError';

type LoginFormProps = {
  onForgotPassword: () => void;
};

export function LoginForm({ onForgotPassword }: LoginFormProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema), mode: 'onTouched' });

  async function onSubmit(values: LoginFormValues) {
    const result = await loginWithEmail(values);

    if (result.ok) {
      setIsRedirecting(true);
      return;
    }

    setError('root', { message: result.message });
  }

  return (
    <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} noValidate className="flex flex-col gap-4">
      <fieldset disabled={isSubmitting || isRedirecting} className="contents">
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Contraseña"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <InlineError message={errors.root?.message} />
        <Button type="submit" isLoading={isSubmitting || isRedirecting}>
          Iniciar sesión
        </Button>
      </fieldset>
      <button
        type="button"
        onClick={onForgotPassword}
        className="font-body self-start text-xs text-ink/70 underline decoration-1 underline-offset-2 hover:text-field-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta dark:text-bone/70 dark:hover:text-field-cyan dark:focus-visible:outline-field-cyan"
      >
        ¿Olvidaste tu contraseña?
      </button>
    </form>
  );
}
