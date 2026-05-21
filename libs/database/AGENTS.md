# Purpose
`libs/database` owns shared Prisma lifecycle wiring and schema-agnostic database module utilities.

# Do
- Keep this lib generic enough to support multiple app-owned Prisma clients.
- Keep `DatabaseModule` and `PrismaService` focused on runtime lifecycle and injection.
- Keep database URL parsing and module tokens here when they are shared concerns.

# Do Not
- Do not place app-specific Prisma schema files here.
- Do not make this lib own domain repositories for one service.
- Do not assume a single generated Prisma client for the whole monorepo unless the architecture is explicitly changed.

# Verify
- Run `npm exec nx lint database`.
- Run `npm exec nx typecheck database`.
- Run `npm exec nx test database`.
- Run `npm exec nx build database`.

# Related Areas
- App-owned schemas belong in `apps/*/prisma`.
- Shared environment parsing overlaps with service config in `apps/`.
