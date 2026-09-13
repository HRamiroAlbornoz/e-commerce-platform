import { z } from 'zod';

const redirectStateSchema = z.object({ from: z.string() });

export function buildRedirectState(path: string): { from: string } {
  return { from: path };
}

export function getRedirectPath(state: unknown): string {
  const result = redirectStateSchema.safeParse(state);
  return result.success ? result.data.from : '/';
}
