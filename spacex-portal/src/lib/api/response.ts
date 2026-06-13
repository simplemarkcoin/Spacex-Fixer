/**
 * API Response Type Definitions
 * 
 * Provides clean, predictable response shapes for all API operations.
 * All API functions return either ApiSuccess<T> | ApiFailure.
 */

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/**
 * Create a successful API response
 */
export function success<T>(data: T): ApiSuccess<T> {
  return {
    ok: true,
    data,
  };
}

/**
 * Create a failure API response
 */
export function failure(code: string, message: string): ApiFailure {
  return {
    ok: false,
    error: {
      code,
      message,
    },
  };
}

/**
 * Type guard to check if response is successful
 */
export function isSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
  return response.ok === true;
}

/**
 * Type guard to check if response is a failure
 */
export function isFailure<T>(response: ApiResponse<T>): response is ApiFailure {
  return response.ok === false;
}
