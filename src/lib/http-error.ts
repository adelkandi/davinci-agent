/**
 * Generic HTTP error utility for API route handlers.
 * Not wired to any DaVinci-specific route today.
 */

export class HttpError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

export function toErrorResponse(error: unknown): { status: number; body: Record<string, unknown> } {
  if (error instanceof HttpError) {
    return { status: error.status, body: { error: error.message, details: error.details } };
  }
  if (error instanceof Error) {
    return { status: 500, body: { error: error.message } };
  }
  return { status: 500, body: { error: "Unknown error" } };
}
