import { Inject, Injectable } from '@nestjs/common';
import type { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MESSAGING_CLIENT } from './constants/messaging.tokens';
import type { MessagePublisher } from './interfaces/message-publisher.interface';

type ClientProxyLike = Pick<ClientProxy, 'emit'>;

@Injectable()
export class NatsMessagePublisher implements MessagePublisher {
  constructor(
    @Inject(MESSAGING_CLIENT)
    private readonly client: ClientProxyLike,
  ) {}

  async emit<T>(subject: string, payload: T): Promise<void> {
    await firstValueFrom(this.client.emit(subject, payload));
  }
}
