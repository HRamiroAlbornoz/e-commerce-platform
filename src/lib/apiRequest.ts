import { getIdToken, type User } from 'firebase/auth';
import type { z } from 'zod';

export type ApiRequestResult<T> = { ok: true; data: T } | { ok: false; message: string };

export async function postJsonRequest<T>(
  user: User,
  path: string,
  body: unknown,
  responseSchema: z.ZodType<T>,
  errorSchema: z.ZodType<{ message: string }>,
  genericErrorMessage: string,
): Promise<ApiRequestResult<T>> {
  try {
    const token = await getIdToken(user);
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });

    const responseBody: unknown = await response.json();

    if (response.ok) {
      const parsed = responseSchema.safeParse(responseBody);
      return parsed.success ? { ok: true, data: parsed.data } : { ok: false, message: genericErrorMessage };
    }

    const parsedError = errorSchema.safeParse(responseBody);
    return {
      ok: false,
      message: parsedError.success ? parsedError.data.message : genericErrorMessage,
    };
  } catch {
    return { ok: false, message: genericErrorMessage };
  }
}
