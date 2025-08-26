import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/server/utils/logger';

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  details?: any;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly details?: any;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this, AppError);
  }
}

/**
 * Centralized error handler for API routes
 */
export function serverErrorHandler(error: unknown, context?: { requestId?: string; userId?: string; endpoint?: string }): NextResponse {
  // Log the error with context
  logger.error('API Error occurred', error, context);

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: error.errors
      },
      { status: 400 }
    );
  }

  // Handle custom AppError
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details
      },
      { status: error.statusCode }
    );
  }

  // Handle standard Error
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR'
    },
    { status: 500 }
  );
}

/**
 * Async wrapper that catches errors and handles them appropriately
 */
export function withServerErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>,
  context?: { endpoint?: string }
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return serverErrorHandler(error, context);
    }
  };
}
