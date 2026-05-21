# Purpose
`auth-service` owns identity entrypoints for authentication: register, login, and refresh token flows.

# Do
- Keep auth feature code under `src/app/auth/**`.
- Keep auth-specific DTOs, response payload types, and error codes local to this service until another consumer clearly needs them.
- Keep password hashing, refresh-token rotation, and JWT issuance logic inside this service.
- Keep the Prisma schema for auth-owned data under `prisma/`.
- If the auth HTTP path changes, update Kong route fragments in `infrastructure/kong/`.

# Do Not
- Do not move auth business rules into `libs/common`.
- Do not store plain passwords or plain refresh tokens.
- Do not treat `libs/database` as the place for auth schema ownership.
- Do not add NATS publishing here unless the feature explicitly requires auth events.

# Verify
- Run `npx prisma generate --config apps/auth-service/prisma.config.ts` after schema/client changes.
- Run `npm exec nx lint auth-service`.
- Run `npm exec nx typecheck auth-service`.
- Run `npm exec nx test auth-service`.
- Run `npm exec nx build auth-service`.

# Related Areas
- Route changes usually require `infrastructure/kong/routes/auth.routes.yml`.
- Shared response and validation behavior comes from `libs/common`.
- Prisma lifecycle wiring comes from `libs/database`.
