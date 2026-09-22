import { useCallback, useEffect, useState } from 'react';

type AsyncResourceState<T> =
  { status: 'loading' } | { status: 'error'; message: string } | { status: 'success'; data: T };

type FetchResult<T> = { key: string; state: AsyncResourceState<T> };

export function useKeyedAsync<T>(
  key: string,
  fetcher: () => Promise<T>,
  errorMessage: string,
): AsyncResourceState<T> & { retry: () => void } {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<FetchResult<T> | null>(null);
  const requestKey = `${key}::${attempt}`;

  useEffect(() => {
    let isMounted = true;

    fetcher()
      .then((data) => {
        if (isMounted) {
          setResult({ key: requestKey, state: { status: 'success', data } });
        }
      })
      .catch(() => {
        if (isMounted) {
          setResult({ key: requestKey, state: { status: 'error', message: errorMessage } });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [requestKey, fetcher, errorMessage]);

  const retry = useCallback(() => {
    setAttempt((current) => current + 1);
  }, []);

  if (result === null || result.key !== requestKey) {
    return { status: 'loading', retry };
  }

  return { ...result.state, retry };
}
