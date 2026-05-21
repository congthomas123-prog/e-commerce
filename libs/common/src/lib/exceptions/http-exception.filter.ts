import {
  ArgumentsHost,
  Catch,
  type ExceptionFilter,
  type HttpException,
  HttpStatus,
} from '@nestjs/common';
import { createErrorResponse } from '../response/create-error-response';

type HttpExceptionResponseBody = {
  message?: string | string[];
  errorCode?: string;
  details?: unknown;
  statusCode?: number;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<{
      status: (statusCode: number) => { json: (body: unknown) => void };
    }>();
    const request = host.switchToHttp().getRequest<{ url?: string }>();
    const statusCode = this.getStatusCode(exception);
    const errorPayload = this.getErrorPayload(exception, statusCode, request.url);

    response.status(statusCode).json(errorPayload);
  }

  private getStatusCode(exception: unknown): number {
    if (this.isHttpException(exception)) {
      return exception.getStatus();
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getErrorPayload(
    exception: unknown,
    statusCode: number,
    path?: string,
  ) {
    if (!this.isHttpException(exception)) {
      return createErrorResponse({ path });
    }

    const exceptionResponse = exception.getResponse();
    const normalizedResponse =
      typeof exceptionResponse === 'string'
        ? { message: exceptionResponse }
        : (exceptionResponse as HttpExceptionResponseBody);
    const message = Array.isArray(normalizedResponse.message)
      ? normalizedResponse.message.join(', ')
      : normalizedResponse.message;
    const errorCode =
      normalizedResponse.errorCode ?? HttpStatus[statusCode] ?? 'UNKNOWN_ERROR';

    return createErrorResponse({
      message,
      errorCode,
      details: normalizedResponse.details,
      path,
    });
  }

  private isHttpException(exception: unknown): exception is HttpException {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'getStatus' in exception &&
      'getResponse' in exception
    );
  }
}
