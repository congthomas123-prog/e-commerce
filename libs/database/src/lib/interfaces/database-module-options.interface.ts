import type { InjectionToken, ModuleMetadata, OptionalFactoryDependency } from '@nestjs/common';
import type { PrismaClientLike } from './prisma-client-like.interface';

export interface DatabaseModuleOptions {
  client: PrismaClientLike;
  connectOnModuleInit?: boolean;
  disconnectOnModuleDestroy?: boolean;
}

export interface DatabaseModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
  useFactory: (...args: unknown[]) =>
    | DatabaseModuleOptions
    | Promise<DatabaseModuleOptions>;
}
