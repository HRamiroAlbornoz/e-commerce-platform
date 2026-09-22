export type SubmitState =
  { status: 'idle' } | { status: 'submitting' } | { status: 'error'; message: string };
