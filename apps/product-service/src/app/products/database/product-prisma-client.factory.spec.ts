import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../../generated/prisma';
import { createProductPrismaClient } from './product-prisma-client.factory';

jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn(),
}));

jest.mock('../../../generated/prisma', () => ({
  PrismaClient: jest.fn(),
}));

describe('createProductPrismaClient', () => {
  it('creates a Prisma client with resolved database URL', () => {
    const prismaPgMock = PrismaPg as jest.Mock;
    const prismaClientMock = PrismaClient as unknown as jest.Mock;

    prismaPgMock.mockReturnValue({ adapter: 'pg-adapter' });
    prismaClientMock.mockReturnValue({ client: 'prisma-client' });

    const client = createProductPrismaClient(
      'postgresql://db.example/product_service',
    );

    expect(prismaPgMock).toHaveBeenCalledWith({
      connectionString: 'postgresql://db.example/product_service',
    });
    expect(prismaClientMock).toHaveBeenCalledWith({
      adapter: { adapter: 'pg-adapter' },
    });
    expect(client).toEqual({ client: 'prisma-client' });
  });
});
