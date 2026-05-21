import type { InjectionToken, ModuleMetadata, OptionalFactoryDependency } from '@nestjs/common';

export interface MessagingModuleOptions {
  servers: string[];
  queue?: string;
  clientName?: string;
}

export interface MessagingModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
  useFactory: (...args: unknown[]) =>
    | MessagingModuleOptions
    | Promise<MessagingModuleOptions>;
}
