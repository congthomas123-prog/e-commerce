# Purpose
`infrastructure/redis` owns Redis runtime config plus shared notes for cache, session, and rate-limit usage.

# Do
- Keep broker-independent Redis config and environment-wide usage guidance here.
- Keep cache/session/rate-limit docs aligned with the actual service behavior that uses them.
- Treat key patterns, TTL assumptions, and rate-limit policies as cross-service contracts when shared.

# Do Not
- Do not place service business logic here.
- Do not let docs claim cache behavior that the services do not implement.
- Do not hide auth/session ownership decisions in infra files alone.

# Verify
- Review Redis config and touched docs together for consistency.
- Re-run affected service tests when changing documented cache/session assumptions.

# Related Areas
- App-side cache/session implementations live in `apps/*`.
