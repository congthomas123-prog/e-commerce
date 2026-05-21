import { DEFAULT_ERROR_MESSAGES } from '../constants/default-error-messages.constants';
import { ERROR_CODES } from '../constants/error-codes.constants';
import type { ApiErrorResponse } from '../types/api-response.types';
import { getCurrentTimestamp } from '../utils/date/get-current-timestamp';

type CreateErrorResponseOptions = {
  message?: string;
  errorCode?: string;
  details?: unknown;
  path?: string;
};

export function createErrorResponse(
  options: CreateErrorResponseOptions = {},
): ApiErrorResponse {
  return {
    success: false,
    message:
      options.message ?? DEFAULT_ERROR_MESSAGES.internalServerError,
    errorCode: options.errorCode ?? ERROR_CODES.internalServerError,
    ...(options.details === undefined ? {} : { details: options.details }),
    ...(options.path ? { path: options.path } : {}),
    timestamp: getCurrentTimestamp(),
  };
}
