/**
 * API Error Codes
 * 
 * Standardized error codes used across the API layer.
 * Each code has a consistent meaning and appropriate HTTP semantics.
 */

export const API_ERRORS = {
  /**
   * User is not authenticated (no valid session)
   * HTTP 401
   */
  UNAUTHENTICATED: 'UNAUTHENTICATED',

  /**
   * User is authenticated but lacks permission
   * HTTP 403
   */
  FORBIDDEN: 'FORBIDDEN',

  /**
   * Resource not found
   * HTTP 404
   */
  NOT_FOUND: 'NOT_FOUND',

  /**
   * Input validation failed
   * HTTP 400
   */
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  /**
   * Database operation failed
   * HTTP 500
   */
  DATABASE_ERROR: 'DATABASE_ERROR',

  /**
   * Unexpected error
   * HTTP 500
   */
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ApiErrorCode = typeof API_ERRORS[keyof typeof API_ERRORS];

/**
 * Map error codes to HTTP status codes
 */
export function getHttpStatus(errorCode: ApiErrorCode): number {
  switch (errorCode) {
    case API_ERRORS.UNAUTHENTICATED:
      return 401;
    case API_ERRORS.FORBIDDEN:
      return 403;
    case API_ERRORS.NOT_FOUND:
      return 404;
    case API_ERRORS.VALIDATION_ERROR:
      return 400;
    case API_ERRORS.DATABASE_ERROR:
    case API_ERRORS.UNKNOWN_ERROR:
    default:
      return 500;
  }
}
