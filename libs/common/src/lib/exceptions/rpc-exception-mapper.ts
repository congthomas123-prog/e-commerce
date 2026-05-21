import { RpcException } from '@nestjs/microservices';
import { DEFAULT_ERROR_MESSAGES } from '../constants/default-error-messages.constants';
import { ERROR_CODES } from '../constants/error-codes.constants';
import { createErrorResponse } from '../response/create-error-response';

type RpcExceptionBody = {
  message?: string;
  errorCode?: string;
  details?: unknown;
};

export function mapRpcException(exception: unknown) {
  if (!(exception instanceof RpcException)) {
    return createErrorResponse({
      message: DEFAULT_ERROR_MESSAGES.rpcUnhandledError,
      errorCode: ERROR_CODES.rpcUnhandledError,
    });
  }

  const payload = exception.getError();
  const normalizedPayload =
    typeof payload === 'string'
      ? { message: payload }
      : ((payload ?? {}) as RpcExceptionBody);

  return createErrorResponse({
    message: normalizedPayload.message,
    errorCode: normalizedPayload.errorCode ?? ERROR_CODES.rpcUnhandledError,
    details: normalizedPayload.details,
  });
}
