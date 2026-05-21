import {
  Inject,
  Injectable,
  Optional,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { DATABASE_MODULE_OPTIONS, PRISMA_CLIENT } from './constants/database.tokens';
import type { DatabaseModuleOptions } from './interfaces/database-module-options.interface';
import type { PrismaClientLike } from './interfaces/prisma-client-like.interface';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject(PRISMA_CLIENT)
    private readonly client: PrismaClientLike,
    @Optional()
    @Inject(DATABASE_MODULE_OPTIONS)
    private readonly options: Omit<DatabaseModuleOptions, 'client'> = {},
  ) {}

  get instance(): PrismaClientLike {
    return this.client;
  }

  async onModuleInit(): Promise<void> {
    if (this.options.connectOnModuleInit === false) {
      return;
    }

    await this.client.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.options.disconnectOnModuleDestroy === false) {
      return;
    }

    await this.client.$disconnect();
  }
}
