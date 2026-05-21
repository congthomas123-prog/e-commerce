import type { MessagingModuleOptions } from '../interfaces/messaging-module-options.interface';

type EnvSource = Record<string, string | undefined>;

export function createMessagingModuleOptionsFromEnv(
  env: EnvSource = process.env,
): MessagingModuleOptions {
  const servers = (env.NATS_SERVERS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (servers.length === 0) {
    throw new Error(
      'NATS_SERVERS environment variable must contain at least one server.',
    );
  }

  return {
    servers,
    ...(env.NATS_QUEUE?.trim() ? { queue: env.NATS_QUEUE.trim() } : {}),
    ...(env.NATS_CLIENT_NAME?.trim()
      ? { clientName: env.NATS_CLIENT_NAME.trim() }
      : {}),
  };
}
