import { NextResponse } from "next/server";
import {
  ErrorCode,
  defaultErrorCodeForStatus,
  type ErrorResponseBody,
} from "@/shared/error-codes";
import { DomainError } from "../../domain/errors/domain-error";

export class HttpError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(
    status: number,
    message: string,
    code?: ErrorCode,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code ?? defaultErrorCodeForStatus(status);
    this.details = details;
  }
}

export function notFound(
  message: string,
  code?: ErrorCode,
  details?: Record<string, unknown>,
): never {
  throw new HttpError(404, message, code, details);
}

export function badRequest(
  message: string,
  code?: ErrorCode,
  details?: Record<string, unknown>,
): never {
  throw new HttpError(400, message, code, details);
}

export function forbidden(
  message: string,
  code?: ErrorCode,
  details?: Record<string, unknown>,
): never {
  throw new HttpError(403, message, code, details);
}

export function conflict(
  message: string,
  code?: ErrorCode,
  details?: Record<string, unknown>,
): never {
  throw new HttpError(409, message, code, details);
}

export function ok<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

export function created<T>(data: T): NextResponse<T> {
  return NextResponse.json(data, { status: 201 });
}

function errorBody(
  message: string,
  code: ErrorCode,
  details?: Record<string, unknown>,
): ErrorResponseBody {
  return details ? { error: message, code, details } : { error: message, code };
}

export function errorResponse(error: {
  message: string;
  status: number;
  code?: ErrorCode;
  details?: Record<string, unknown>;
}): NextResponse<ErrorResponseBody> {
  const code = error.code ?? defaultErrorCodeForStatus(error.status);
  return NextResponse.json(errorBody(error.message, code, error.details), {
    status: error.status,
  });
}

export function getApiErrorStatus(error: unknown): number {
  if (error instanceof HttpError) return error.status;
  if (error instanceof DomainError) {
    return error.name.endsWith("NotFoundError") ? 404 : 400;
  }
  return 500;
}

export function mapApiErrorToResponse(
  error: unknown,
): NextResponse<ErrorResponseBody> {
  if (error instanceof HttpError) {
    return NextResponse.json(
      errorBody(error.message, error.code, error.details),
      { status: error.status },
    );
  }

  if (error instanceof DomainError) {
    const status = error.name.endsWith("NotFoundError") ? 404 : 400;
    return NextResponse.json(
      errorBody(error.message, error.code, error.details),
      { status },
    );
  }

  console.error("Unhandled API error:", error);
  return NextResponse.json(
    { error: "Internal server error", code: ErrorCode.INTERNAL },
    { status: 500 },
  );
}
