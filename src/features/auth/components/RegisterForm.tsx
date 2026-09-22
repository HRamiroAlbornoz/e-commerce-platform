import { useState } from 'react';
import { useForm, useWatch, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  MIN_PASSWORD_LENGTH,
  registerFormSchema,
  type RegisterFormValues,
} from '@/features/auth/schemas/authForms';
import { registerWithEmail } from '@/features/auth/services/registerWithEmail';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { InlineError } from '@/components/ui/InlineError';

type RegisterSubmitButtonProps = {
  control: Control<RegisterFormValues>;
  isLoading: boolean;
};

function RegisterSubmitButton({ control, isLoading }: RegisterSubmitButtonProps) {
  const password = useWatch({ control, name: 'password' });
  const isPasswordTooShort = password.length < MIN_PASSWORD_LENGTH;

  return (
    <Button type="submit" isLoading={isLoading} disabled={isPasswordTooShort}>
      Crear cuenta
    </Button>
  );
}

export function RegisterForm() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    mode: 'onTouched',
    defaultValues: { displayName: '', email: '', password: '' },
  });

  async function onSubmit(values: RegisterFormValues) {
    const result = await registerWithEmail(values);

    if (result.ok) {
      setIsRedirecting(true);
      return;
    }

    if (result.field === 'email') {
      setError('email', { message: result.message });
      return;
    }

    setError('root', { message: result.message });
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(onSubmit)(event)}
      noValidate
      className="flex flex-col gap-4"
    >
      <fieldset disabled={isSubmitting || isRedirecting} className="contents">
        <TextField
          label="Nombre"
          type="text"
          autoComplete="name"
          error={errors.displayName?.message}
          {...register('displayName')}
        />
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
          autoComplete="new-password"
          hint={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`}
          error={errors.password?.message}
          {...register('password')}
        />
        <InlineError message={errors.root?.message} />
        <RegisterSubmitButton control={control} isLoading={isSubmitting || isRedirecting} />
      </fieldset>
    </form>
  );
}
