/**
 * Standardized error codes and HTTP status mapping used by all API route handlers.
 */

export const API_ERRORS = {
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const

export type ApiErrorCode = (typeof API_ERRORS)[keyof typeof API_ERRORS]

export function httpStatus(code: ApiErrorCode): number {
  switch (code) {
    case API_ERRORS.NOT_FOUND:
      return 404
    case API_ERRORS.VALIDATION_ERROR:
      return 400
    default:
      return 500
  }
}
