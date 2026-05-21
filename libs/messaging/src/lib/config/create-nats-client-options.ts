import { Transport, type NatsOptions } from '@nestjs/microservices';
import type { MessagingModuleOptions } from '../interfaces/messaging-module-options.interface';

export function createNatsClientOptions(
  options: MessagingModuleOptions,
): NatsOptions {
  return {
    transport: Transport.NATS,
    options: {
      servers: options.servers,
      ...(options.queue ? { queue: options.queue } : {}),
      ...(options.clientName ? { name: options.clientName } : {}),
    },
  };
}
