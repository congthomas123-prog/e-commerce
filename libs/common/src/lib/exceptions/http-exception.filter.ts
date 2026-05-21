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
  /**
   * Main entrypoint of the NestJS exception filter.
   * Catches all unhandled exceptions occurring in the request lifecycle and responds with a standardized format.
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<{
      status: (statusCode: number) => { json: (body: unknown) => void };
    }>();
    const request = host.switchToHttp().getRequest<{ url?: string }>();
    const statusCode = this.getStatusCode(exception);
    const errorPayload = this.getErrorPayload(exception, statusCode, request.url);

    response.status(statusCode).json(errorPayload);
  }

  /**
   * Resolves the appropriate HTTP Status Code from the exception.
   * Defaults to 500 INTERNAL_SERVER_ERROR for non-HTTP exceptions.
   */
  private getStatusCode(exception: unknown): number {
    if (this.isHttpException(exception)) {
      return exception.getStatus();
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * Formats the final error response payload.
   * Normalizes NestJS built-in error messages, custom error codes, and validation lists.
   */
  private getErrorPayload(
    exception: unknown,
    statusCode: number,
    path?: string,
  ) {
    // If not a known HttpException, return a generic INTERNAL_SERVER_ERROR payload
    if (!this.isHttpException(exception)) {
      return createErrorResponse({ path });
    }

    const exceptionResponse = exception.getResponse();
    const normalizedResponse =
      typeof exceptionResponse === 'string'
        ? { message: exceptionResponse }
        : (exceptionResponse as HttpExceptionResponseBody);
    
    // Join multiple validation error messages (if array) into a single comma-separated string
    const message = Array.isArray(normalizedResponse.message)
      ? normalizedResponse.message.join(', ')
      : normalizedResponse.message;
      
    // Use custom error code if provided, fallback to the status key or generic UNKNOWN_ERROR
    const errorCode =
      normalizedResponse.errorCode ?? HttpStatus[statusCode] ?? 'UNKNOWN_ERROR';

    return createErrorResponse({
      message,
      errorCode,
      details: normalizedResponse.details,
      path,
    });
  }

  /**
   * Helper guard to determine if the caught exception is a standard NestJS HttpException.
   */
  private isHttpException(exception: unknown): exception is HttpException {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      'getStatus' in exception &&
      'getResponse' in exception
    );
  }
}
