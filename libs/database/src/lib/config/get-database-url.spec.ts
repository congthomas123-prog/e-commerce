import { getDatabaseUrl } from './get-database-url';

describe('getDatabaseUrl', () => {
  it('returns DATABASE_URL from the provided env source', () => {
    expect(
      getDatabaseUrl({
        DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/auth',
      }),
    ).toBe('postgresql://postgres:postgres@localhost:5432/auth');
  });

  it('rejects missing DATABASE_URL', () => {
    expect(() => getDatabaseUrl({})).toThrow(
      'DATABASE_URL environment variable is required.',
    );
  });
});
