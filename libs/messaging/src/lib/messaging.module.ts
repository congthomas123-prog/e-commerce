import {
  type DynamicModule,
  Module,
  type Provider,
} from '@nestjs/common';
import { ClientProxyFactory } from '@nestjs/microservices';
import { createNatsClientOptions } from './config/create-nats-client-options';
import { MESSAGING_CLIENT, MESSAGING_MODULE_OPTIONS } from './constants/messaging.tokens';
import type {
  MessagingModuleAsyncOptions,
  MessagingModuleOptions,
} from './interfaces/messaging-module-options.interface';
import { NatsMessagePublisher } from './nats-message-publisher';

@Module({
  providers: [NatsMessagePublisher],
  exports: [NatsMessagePublisher],
})
export class MessagingModule {
  static register(options: MessagingModuleOptions): DynamicModule {
    return {
      module: MessagingModule,
      providers: [
        {
          provide: MESSAGING_MODULE_OPTIONS,
          useValue: options,
        },
        {
          provide: MESSAGING_CLIENT,
          useFactory: () => ClientProxyFactory.create(createNatsClientOptions(options)),
        },
      ],
      exports: [MESSAGING_CLIENT, NatsMessagePublisher],
    };
  }

  static registerAsync(options: MessagingModuleAsyncOptions): DynamicModule {
    const asyncOptionsProvider: Provider = {
      provide: MESSAGING_MODULE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject ?? [],
    };
    const messagingClientProvider: Provider = {
      provide: MESSAGING_CLIENT,
      useFactory: async (moduleOptions: MessagingModuleOptions) =>
        ClientProxyFactory.create(createNatsClientOptions(moduleOptions)),
      inject: [MESSAGING_MODULE_OPTIONS],
    };

    return {
      module: MessagingModule,
      imports: options.imports,
      providers: [asyncOptionsProvider, messagingClientProvider],
      exports: [MESSAGING_CLIENT, NatsMessagePublisher],
    };
  }
}
