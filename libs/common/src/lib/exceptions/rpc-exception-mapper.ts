import { RpcException } from '@nestjs/microservices';
import { DEFAULT_ERROR_MESSAGES } from '../constants/default-error-messages.constants';
import { ERROR_CODES } from '../constants/error-codes.constants';
import { createErrorResponse } from '../response/create-error-response';

/**
 * Expected shape of an RPC exception's error payload.
 */
type RpcExceptionBody = {
  message?: string;
  errorCode?: string;
  details?: unknown;
};

/**
 * Normalizes RPC exceptions (e.g., from NATS microservice communication)
 * into a standardized error response format used across the application.
 */
export function mapRpcException(exception: unknown) {
  // If the exception is not a recognized NestJS RpcException,
  // return a standardized unhandled RPC error response.
  if (!(exception instanceof RpcException)) {
    return createErrorResponse({
      message: DEFAULT_ERROR_MESSAGES.rpcUnhandledError,
      errorCode: ERROR_CODES.rpcUnhandledError,
    });
  }

  const payload = exception.getError();
  
  // Normalize the payload: handle both string errors and custom structured error objects.
  const normalizedPayload =
    typeof payload === 'string'
      ? { message: payload }
      : ((payload ?? {}) as RpcExceptionBody);

  // Return the standardized error response format.
  return createErrorResponse({
    message: normalizedPayload.message,
    errorCode: normalizedPayload.errorCode ?? ERROR_CODES.rpcUnhandledError,
    details: normalizedPayload.details,
  });
}
