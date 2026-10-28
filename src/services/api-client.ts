export type ServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: string; code?: string };

export function success<T>(data: T): ServiceResult<T> {
  return { data, error: null };
}

export function failure<T = null>(
  error: unknown,
  fallbackMessage = "An unexpected error occurred",
): ServiceResult<T> {
  if (typeof error === "string") {
    return { data: null, error };
  }
  if (error && typeof error === "object") {
    const err = error as { message?: string; code?: string };
    return {
      data: null,
      error: err.message || fallbackMessage,
      code: err.code,
    };
  }
  return { data: null, error: fallbackMessage };
}

