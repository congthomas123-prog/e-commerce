import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('connects and disconnects through the injected client lifecycle', async () => {
    const client = {
      $connect: jest.fn().mockResolvedValue(undefined),
      $disconnect: jest.fn().mockResolvedValue(undefined),
    };

    const service = new PrismaService(client);

    await service.onModuleInit();
    await service.onModuleDestroy();

    expect(client.$connect).toHaveBeenCalledTimes(1);
    expect(client.$disconnect).toHaveBeenCalledTimes(1);
    expect(service.instance).toBe(client);
  });
});
