/**
 * Type-guard helpers for narrowing API results on the client side.
 */

import type { ApiOk, ApiError } from './types'

export function isSuccess<T>(result: ApiOk<T> | ApiError): result is ApiOk<T> {
  return result.ok === true
}

export function isFailure<T>(result: ApiOk<T> | ApiError): result is ApiError {
  return result.ok === false
}
