import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyRequestToken } from './verifyRequestToken.js';

const INVALID_METHOD_MESSAGE = 'Método no permitido.';
const UNAUTHENTICATED_MESSAGE = 'Sesión inválida o expirada. Iniciá sesión de nuevo.';
const FORBIDDEN_MESSAGE = 'No tenés permisos para esta acción.';

export type RequireAdminErrorCode = 'INVALID_REQUEST' | 'UNAUTHENTICATED' | 'FORBIDDEN';

export async function requireAdmin<E>(
  req: VercelRequest,
  res: VercelResponse,
  requestId: string,
  makeError: (code: RequireAdminErrorCode, message: string) => E,
  respond: (res: VercelResponse, requestId: string, error: E) => void,
): Promise<{ uid: string } | null> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    respond(res, requestId, makeError('INVALID_REQUEST', INVALID_METHOD_MESSAGE));
    return null;
  }

  const auth = await verifyRequestToken(req);
  if (!auth.ok) {
    respond(res, requestId, makeError('UNAUTHENTICATED', UNAUTHENTICATED_MESSAGE));
    return null;
  }

  if (auth.role !== 'admin') {
    respond(res, requestId, makeError('FORBIDDEN', FORBIDDEN_MESSAGE));
    return null;
  }

  return { uid: auth.uid };
}
