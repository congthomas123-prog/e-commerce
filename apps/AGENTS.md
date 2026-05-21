# Purpose
`apps/` contains independently deployable services. Keep business logic, service-local DTOs, and service-local error codes inside the owning app.

# Do
- Treat each service as the owner of its own API, data flow, and app-specific orchestration.
- Keep feature code under `src/app/**` instead of growing flat starter-style files.
- Keep app-owned Prisma schema and generated-client wiring inside the app that owns the data.
- Run verification through Nx for the touched app, for example `npm exec nx test <app>` and `npm exec nx build <app>`.

# Do Not
- Do not move service-specific business rules into `libs/common`.
- Do not make one app reach into another app's source files directly.
- Do not centralize all DTOs or domain error codes in shared libs before there is a real second consumer.

# Verify
- Run `npm exec nx lint <app>`.
- Run `npm exec nx typecheck <app>`.
- Run `npm exec nx test <app>`.
- Run `npm exec nx build <app>`.

# Related Areas
- Shared technical pieces belong in `libs/`.
- Cross-service route and infra changes often require updates in `infrastructure/`.
