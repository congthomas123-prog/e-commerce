import {
  BadRequestException,
  type ArgumentsHost,
  type HttpException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  it('maps Nest HTTP exceptions into the shared error envelope', () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const response = { status, json } as unknown as Response;
    const request = { url: '/api/auth/register' } as Request;

    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as ArgumentsHost;

    const filter = new HttpExceptionFilter();

    filter.catch(new BadRequestException('Invalid payload'), host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Invalid payload',
        errorCode: 'BAD_REQUEST',
        path: '/api/auth/register',
      }),
    );
  });

  it('keeps custom error code from exception response payload', () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const response = { status, json } as unknown as Response;
    const request = { url: '/api/auth/login' } as Request;

    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as ArgumentsHost;

    const filter = new HttpExceptionFilter();
    const exception = new BadRequestException({
      message: 'Validation failed',
      errorCode: 'VALIDATION_ERROR',
      details: { field: 'email' },
    }) as HttpException;

    filter.catch(exception, host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: 'VALIDATION_ERROR',
        details: { field: 'email' },
      }),
    );
  });
});
