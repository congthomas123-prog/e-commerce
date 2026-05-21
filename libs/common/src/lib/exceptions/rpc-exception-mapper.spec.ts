import { RpcException } from '@nestjs/microservices';
import { mapRpcException } from './rpc-exception-mapper';

describe('mapRpcException', () => {
  it('maps RpcException payloads into the shared error envelope without path', () => {
    const result = mapRpcException(
      new RpcException({
        message: 'Token expired',
        errorCode: 'TOKEN_EXPIRED',
        details: { subject: 'auth.refresh' },
      }),
    );

    expect(result).toEqual(
      expect.objectContaining({
        success: false,
        message: 'Token expired',
        errorCode: 'TOKEN_EXPIRED',
        details: { subject: 'auth.refresh' },
      }),
    );
    expect(result).not.toHaveProperty('path');
  });
});
