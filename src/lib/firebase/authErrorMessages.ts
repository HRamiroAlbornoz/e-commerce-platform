const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'Ya existe una cuenta con este email.',
  'auth/invalid-email': 'El email no es válido.',
  'auth/weak-password': 'La contraseña debe tener al menos 8 caracteres.',
  'auth/popup-closed-by-user': 'Cerraste la ventana de Google antes de terminar.',
  'auth/network-request-failed': 'No pudimos conectar. Revisa tu conexión e intenta de nuevo.',
  'auth/too-many-requests': 'Demasiados intentos. Espera un momento e intenta de nuevo.',
};

const DEFAULT_AUTH_ERROR_MESSAGE = 'Ocurrió un error. Intenta de nuevo.';

export function getAuthErrorMessage(code: string): string {
  return AUTH_ERROR_MESSAGES[code] ?? DEFAULT_AUTH_ERROR_MESSAGE;
}
