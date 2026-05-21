import { createMessagingModuleOptionsFromEnv } from './create-messaging-module-options-from-env';

describe('createMessagingModuleOptionsFromEnv', () => {
  it('parses env variables into messaging options', () => {
    expect(
      createMessagingModuleOptionsFromEnv({
        NATS_SERVERS: 'nats://localhost:4222, nats://localhost:4223',
        NATS_QUEUE: 'auth-service',
        NATS_CLIENT_NAME: 'auth-client',
      }),
    ).toEqual({
      servers: ['nats://localhost:4222', 'nats://localhost:4223'],
      queue: 'auth-service',
      clientName: 'auth-client',
    });
  });

  it('rejects empty NATS server lists', () => {
    expect(() =>
      createMessagingModuleOptionsFromEnv({
        NATS_SERVERS: ' , ',
      }),
    ).toThrow('NATS_SERVERS environment variable must contain at least one server.');
  });
});
