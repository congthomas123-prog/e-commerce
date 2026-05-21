# Purpose
`infrastructure/postgres` owns shared Postgres runtime config, bootstrap SQL, and environment-level database setup.

# Do
- Keep bootstrap SQL focused on database creation, grants, or environment initialization.
- Keep infra-wide Postgres config here, such as server config and backup-related assets.
- Keep app database names aligned with service environment configuration.

# Do Not
- Do not treat this folder as the owner of app-level Prisma schema models.
- Do not move service business migrations here if the app already owns them through Prisma or a local migration strategy.
- Do not let bootstrap SQL drift away from the actual set of deployed services.

# Verify
- Review touched SQL/config files for service-name and database-name consistency.
- Re-run affected app setup or integration checks when database bootstrap changes.

# Related Areas
- App-owned schemas belong under `apps/*/prisma`.
