import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../generated/prisma';
import { createOrderPrismaClient } from './order-prisma-client.factory';

jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn(),
}));

jest.mock('../../../generated/prisma', () => ({
  PrismaClient: jest.fn(),
}));

describe('createOrderPrismaClient', () => {
  it('creates Prisma client with resolved database URL', () => {
    const prismaPgMock = PrismaPg as jest.Mock;
    const prismaClientMock = PrismaClient as unknown as jest.Mock;

    prismaPgMock.mockReturnValue({ adapter: 'pg-adapter' });
    prismaClientMock.mockReturnValue({ client: 'prisma-client' });

    const client = createOrderPrismaClient(
      'postgresql://db.example/order_service',
    );

    expect(prismaPgMock).toHaveBeenCalledWith({
      connectionString: 'postgresql://db.example/order_service',
    });
    expect(prismaClientMock).toHaveBeenCalledWith({
      adapter: { adapter: 'pg-adapter' },
    });
    expect(client).toEqual({ client: 'prisma-client' });
  });
});
