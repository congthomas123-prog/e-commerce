# Auth Service 4.1.1 Setup Plan

## Summary

Build `auth-service` from Nest starter scaffold into real auth core behind Kong.

- Public base URL: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`
- Scope: real HTTP auth flow only. No NATS publish/consume in this slice.
- Storage: Prisma + Postgres
- Token model: JWT access token + rotating refresh token
- Route change: update Kong from current `/api/v1/auth` to requested `/api/auth`

## Public API

### `POST /api/auth/register`
Request body:
```json
{
  "email": "user@example.com",
  "password": "StrongPass123",
  "fullName": "Nguyen Van A"
}
```

Behavior:
- Validate email format
- Enforce password min length `8`
- Enforce non-empty `fullName`
- Normalize email to lowercase
- Reject duplicate email with `409 Conflict`

Response `201`:
```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Nguyen Van A"
  }
}
```

### `POST /api/auth/login`
Request body:
```json
{
  "email": "user@example.com",
  "password": "StrongPass123"
}
```

Behavior:
- Normalize email to lowercase
- Reject bad credentials with `401 Unauthorized`

Response `200`:
```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Nguyen Van A"
  }
}
```

### `POST /api/auth/refresh`
Request body:
```json
{
  "refreshToken": "<jwt>"
}
```

Behavior:
- Verify JWT signature and expiry
- Match token subject to stored hashed refresh token
- Rotate refresh token on every success
- Reject invalid, expired, or reused token with `401 Unauthorized`

Response `200`:
```json
{
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Nguyen Van A"
  }
}
```

## Implementation Changes

### Service structure
Replace starter `AppController` / `AppService` pattern in `apps/auth-service/src/app` with auth-focused module layout:

- `AuthModule` wires `ConfigModule`, controller, service, Prisma service, password hashing helper, JWT helper
- `AuthController` exposes `register`, `login`, `refresh`
- `AuthService` owns flow orchestration
- DTOs live with controller layer
- Repository access stays behind Prisma-backed service, not inline in controller

### Persistence
Add Prisma schema under `apps/auth-service/prisma/schema.prisma` with one auth-owned user table:

- `id String @id @default(uuid())`
- `email String @unique`
- `fullName String`
- `passwordHash String`
- `refreshTokenHash String?`
- `createdAt DateTime`
- `updatedAt DateTime`

Rules:
- Store only hashed password
- Store only hashed refresh token, never raw token
- One active refresh token per user for v1
- Register creates user and initial refresh token hash
- Login replaces stored refresh token hash
- Refresh replaces stored refresh token hash again

### JWT and config
Add env-driven config for:

- `PORT=3001`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN=15m`
- `JWT_REFRESH_EXPIRES_IN=7d`
- `BCRYPT_ROUNDS=12`

JWT payload:
```json
{
  "sub": "user-uuid",
  "email": "user@example.com"
}
```

### HTTP app and gateway
Keep Nest global prefix `api` in `main.ts`. Set controller prefix to `auth` so final routes become `/api/auth/*`.

Update Kong route config in `infrastructure/kong/routes/auth.routes.yml` to use `/api/auth`. Keep auth service upstream on port `3001`. Update related env/docs text anywhere still hardcodes `/api/v1/auth`.

### Error handling and validation
Use Nest validation pipe globally.

- `400 Bad Request`: DTO validation failures
- `401 Unauthorized`: invalid credentials, invalid refresh token, expired refresh token
- `409 Conflict`: email already exists

Do not add password reset, logout, social auth, roles, guards for protected resources, or NATS messaging in this plan.

## Test Plan

Run through Nx only:

- `npm exec nx test auth-service`
- `npm exec nx lint auth-service`
- `npm exec nx typecheck auth-service`
- `npm exec nx build auth-service`

Required scenarios:

- Register success creates user, hashes password, returns token pair
- Register duplicate email returns `409`
- Login success returns new token pair and rotates stored refresh token hash
- Login wrong password returns `401`
- Refresh success returns new token pair and invalidates previous refresh token
- Refresh with expired token returns `401`
- Refresh with malformed token returns `401`
- Refresh with old rotated token returns `401`
- DTO validation rejects bad email, short password, empty fullName, missing refresh token
- Kong smoke check forwards `POST /api/auth/*` to auth-service after route update

## Assumptions

- Auth v1 is standalone HTTP service only; event publishing waits for later slice
- `fullName` is required on register and returned in auth responses
- Single-device refresh session is acceptable for v1
- No separate `user-service` write on register; auth-service owns its own user record for now
- Shared `libs/auth` stays untouched unless another service/client needs these contracts immediately
