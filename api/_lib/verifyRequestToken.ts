import type { VercelRequest } from '@vercel/node';
import { adminAuth } from './firebaseAdmin.js';

export type VerifyRequestTokenResult = { ok: true; uid: string } | { ok: false };

export async function verifyRequestToken(req: VercelRequest): Promise<VerifyRequestTokenResult> {
  const header = req.headers['authorization'];
  const token = typeof header === 'string' ? header.replace(/^Bearer\s+/i, '') : '';

  if (!token) {
    return { ok: false };
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token, true);
    return { ok: true, uid: decoded.uid };
  } catch {
    return { ok: false };
  }
}
