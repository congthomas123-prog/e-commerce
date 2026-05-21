import { Test } from '@nestjs/testing';
import { PrismaService, DatabaseModule } from '@org/database';
import { createAuthPrismaClient } from './database/auth-prisma-client.factory';

describe('createAuthPrismaClient', () => {
  it('creates a Prisma client that can be wired through DatabaseModule', async () => {
    const client = createAuthPrismaClient(
      'postgresql://postgres:postgres@localhost:5432/auth_service',
    );

    const moduleRef = await Test.createTestingModule({
      imports: [
        DatabaseModule.register({
          client,
          connectOnModuleInit: false,
          disconnectOnModuleDestroy: false,
        }),
      ],
    }).compile();

    const prismaService = moduleRef.get(PrismaService);

    expect(prismaService.instance).toBe(client);

    await moduleRef.close();
    await client.$disconnect();
  });
});
