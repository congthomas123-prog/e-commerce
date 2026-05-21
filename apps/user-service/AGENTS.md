# Purpose
`user-service` should own user profile and account data that is not authentication-secret handling.

# Do
- Keep profile, preferences, addresses, and user-facing account data local to this service.
- Keep service-specific DTOs, error codes, and persistence rules inside this app.
- Follow the `src/app/**` feature-module structure when replacing the starter scaffold.
- Use shared libs only for reusable technical foundations.

# Do Not
- Do not move password or refresh-token logic here if `auth-service` already owns it.
- Do not put user-specific business rules into `libs/common`.
- Do not import source files from sibling apps.

# Verify
- Run `npm exec nx lint user-service`.
- Run `npm exec nx typecheck user-service`.
- Run `npm exec nx test user-service`.
- Run `npm exec nx build user-service`.

# Related Areas
- Authentication boundaries should stay aligned with `apps/auth-service/`.
- External route changes may require Kong updates in `infrastructure/kong/`.
