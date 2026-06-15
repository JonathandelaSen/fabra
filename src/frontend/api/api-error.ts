import {
  ErrorCode,
  defaultErrorCodeForStatus,
  isErrorCode,
} from "@/shared/error-codes";

/**
 * Error thrown by frontend API clients when a request fails. Carries the stable
 * machine-readable `code` and optional `details` from the backend envelope so
 * UI code can resolve a localized message (see `resolveErrorMessage`) instead
 * of displaying the developer-facing `message`.
 */
export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: Record<string, unknown>;

  constructor(params: {
    code: ErrorCode;
    status: number;
    message: string;
    details?: Record<string, unknown>;
  }) {
    super(params.message);
    this.name = "ApiError";
    this.code = params.code;
    this.status = params.status;
    this.details = params.details;
  }
}

interface ParsedErrorBody {
  error?: unknown;
  code?: unknown;
  details?: unknown;
}

/**
 * Reads a fetch `Response`, returning the parsed JSON body on success or
 * throwing an `ApiError` carrying the backend error code on failure.
 */
export async function parseJsonResponse<T>(
  res: Response,
  fallbackMessage: string,
): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as ParsedErrorBody & T;
  if (!res.ok) {
    const code = isErrorCode(data.code)
      ? data.code
      : defaultErrorCodeForStatus(res.status);
    const message =
      typeof data.error === "string" && data.error ? data.error : fallbackMessage;
    const details =
      data.details && typeof data.details === "object"
        ? (data.details as Record<string, unknown>)
        : undefined;
    throw new ApiError({ code, status: res.status, message, details });
  }
  return data;
}
