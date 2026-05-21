type EnvSource = Record<string, string | undefined>;

export function getDatabaseUrl(env: EnvSource = process.env): string {
  const databaseUrl = env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required.');
  }

  return databaseUrl;
}
