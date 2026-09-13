export type AuthResult =
  | { ok: true }
  | { ok: false; message: string; field?: 'email' };
