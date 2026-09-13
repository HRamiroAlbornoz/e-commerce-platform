import { useState } from 'react';
import { signInWithGoogle } from '@/features/auth/services/signInWithGoogle';
import { Button } from '@/components/ui/Button';
import { InlineError } from '@/components/ui/InlineError';

export function GoogleSignInButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setIsLoading(true);
    setError(null);
    const result = await signInWithGoogle();

    if (result.ok) {
      return;
    }

    setIsLoading(false);
    setError(result.message);
  }

  return (
    <div className="flex flex-col gap-2">
      <Button isLoading={isLoading} onClick={() => void handleClick()}>
        Continuar con Google
      </Button>
      <InlineError message={error} />
    </div>
  );
}
