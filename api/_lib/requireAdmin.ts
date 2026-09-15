import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyRequestToken } from './verifyRequestToken.js';
import { ProductError, respondWithError } from './productErrors.js';

export async function requireAdmin(
  req: VercelRequest,
  res: VercelResponse,
  requestId: string,
): Promise<{ uid: string } | null> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    respondWithError(res, requestId, new ProductError('INVALID_REQUEST', 'Método no permitido.'));
    return null;
  }

  const auth = await verifyRequestToken(req);
  if (!auth.ok) {
    respondWithError(
      res,
      requestId,
      new ProductError('UNAUTHENTICATED', 'Sesión inválida o expirada. Iniciá sesión de nuevo.'),
    );
    return null;
  }

  if (auth.role !== 'admin') {
    respondWithError(
      res,
      requestId,
      new ProductError('FORBIDDEN', 'No tenés permisos para esta acción.'),
    );
    return null;
  }

  return { uid: auth.uid };
}
