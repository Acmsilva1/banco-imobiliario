interface SupabaseErrorLike {
  message?: string;
  details?: string;
  hint?: string;
}

export const getSupabaseErrorMessage = (
  error: SupabaseErrorLike | null | undefined,
  fallback = 'Falha na operacao'
) => {
  if (!error) return null;
  return error.details || error.hint || error.message || fallback;
};

export const throwIfSupabaseError = (
  error: SupabaseErrorLike | null | undefined,
  fallback?: string
) => {
  const message = getSupabaseErrorMessage(error, fallback);
  if (message) {
    throw new Error(message);
  }
};
