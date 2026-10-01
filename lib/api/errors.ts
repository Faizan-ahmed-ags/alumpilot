/** Domain errors used across API routes. */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const notFound = (message = "Resource not found") =>
  new ApiError(404, message, "NOT_FOUND");

export const forbidden = (message = "You don't have permission to do that") =>
  new ApiError(403, message, "FORBIDDEN");

export const unauthorized = (message = "Please sign in to continue") =>
  new ApiError(401, message, "UNAUTHORIZED");

export const badRequest = (message = "Invalid request", details?: unknown) =>
  new ApiError(400, message, "BAD_REQUEST", details);

/** Sanitize an error message before it reaches the client. */
export function sanitizeError(e: unknown, fallback: string): string {
  if (e instanceof ApiError) return e.message;
  return fallback;
}