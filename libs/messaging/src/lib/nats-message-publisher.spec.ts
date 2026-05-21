import { of } from 'rxjs';
import { NatsMessagePublisher } from './nats-message-publisher';

describe('NatsMessagePublisher', () => {
  it('emits payloads with the provided subject', async () => {
    const client = {
      emit: jest.fn().mockReturnValue(of(undefined)),
    };

    const publisher = new NatsMessagePublisher(client);

    await publisher.emit('auth.event.user-registered', { userId: 'user-1' });

    expect(client.emit).toHaveBeenCalledWith('auth.event.user-registered', {
      userId: 'user-1',
    });
  });
});
