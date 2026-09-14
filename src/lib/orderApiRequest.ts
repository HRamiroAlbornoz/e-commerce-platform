import { getIdToken, type User } from 'firebase/auth';
import type { z } from 'zod';
import { orderErrorResponseSchema } from '@shared/schemas/order';

export type OrderApiResult<T> = { ok: true; data: T } | { ok: false; message: string };

export async function postOrderRequest<T>(
  user: User,
  path: string,
  body: unknown,
  responseSchema: z.ZodType<T>,
  genericErrorMessage: string,
): Promise<OrderApiResult<T>> {
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

    const parsedError = orderErrorResponseSchema.safeParse(responseBody);
    return {
      ok: false,
      message: parsedError.success ? parsedError.data.message : genericErrorMessage,
    };
  } catch {
    return { ok: false, message: genericErrorMessage };
  }
}
