import {
  type DynamicModule,
  Module,
  type Provider,
  Global,
} from '@nestjs/common';
import { DATABASE_MODULE_OPTIONS, PRISMA_CLIENT } from './constants/database.tokens';
import type { DatabaseModuleAsyncOptions, DatabaseModuleOptions } from './interfaces/database-module-options.interface';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {
  static register(options: DatabaseModuleOptions): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: DATABASE_MODULE_OPTIONS,
          useValue: options,
        },
        {
          provide: PRISMA_CLIENT,
          useValue: options.client,
        },
      ],
    };
  }

  static registerAsync(options: DatabaseModuleAsyncOptions): DynamicModule {
    const asyncOptionsProvider: Provider = {
      provide: DATABASE_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject ?? [],
    };
    const prismaClientProvider: Provider = {
      provide: PRISMA_CLIENT,
      useFactory: async (moduleOptions: DatabaseModuleOptions) =>
        moduleOptions.client,
      inject: [DATABASE_MODULE_OPTIONS],
    };

    return {
      module: DatabaseModule,
      imports: options.imports,
      providers: [asyncOptionsProvider, prismaClientProvider],
    };
  }
}
