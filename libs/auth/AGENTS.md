# Purpose
`libs/auth` is reserved for shared auth contracts or helpers once there is a real second consumer.

# Do
- Add code here only when auth-specific types or helpers are reused across multiple services or packages.
- Prefer small, stable contracts such as shared token payload types or public DTO contracts when reuse becomes real.

# Do Not
- Do not move `auth-service` business logic here just because the name matches.
- Do not duplicate what already belongs in `libs/common`.
- Do not add speculative abstractions before a second consumer exists.

# Verify
- Run `npm exec nx lint auth`.
- Run `npm exec nx typecheck auth`.
- Run `npm exec nx build auth`.
- Run `npm exec nx test auth` if tests are added.

# Related Areas
- Current auth business ownership stays in `apps/auth-service/`.
