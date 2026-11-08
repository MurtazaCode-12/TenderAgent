import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Base Application Error class with HTTP status code and machine-readable error codes.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, errorCode = "INTERNAL_SERVER_ERROR", details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication required. Please sign in.") {
    super(message, 401, "UNAUTHENTICATED");
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "You do not have permission to perform this action.") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource", message?: string) {
    super(message || `${resource} was not found.`, 404, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed for provided parameters.", details?: unknown) {
    super(message, 422, "VALIDATION_ERROR", details);
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests. Please slow down and try again shortly.") {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
  }
}

export class AIServiceError extends AppError {
  constructor(message = "AI service failed to process request.", details?: unknown) {
    super(message, 502, "AI_PROCESSING_ERROR", details);
  }
}

export class WhatsAppServiceError extends AppError {
  constructor(message = "Failed to deliver or process WhatsApp message.", details?: unknown) {
    super(message, 502, "WHATSAPP_API_ERROR", details);
  }
}

/**
 * Centralized API Route error handler that converts errors to consistent JSON responses.
 */
export function handleApiError(error: unknown) {
  console.error("[API Error Caught]:", error);

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: error.flatten().fieldErrors,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 422 }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.errorCode,
          message: error.message,
          details: error.details,
        },
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    );
  }

  const fallbackMessage = error instanceof Error ? error.message : "An unexpected server error occurred.";

  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: fallbackMessage,
      },
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}
