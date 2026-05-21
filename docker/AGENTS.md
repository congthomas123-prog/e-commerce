# Purpose
`docker/` is reserved for cross-service container assets that do not naturally belong inside one app or one infra area.

# Do
- Put only shared Docker helpers, compose fragments, or container tooling here.
- Keep Docker assets aligned with real service ports, env vars, and infrastructure config.

# Do Not
- Do not duplicate app source code here.
- Do not add one-service-only runtime config here if it belongs under that service or infra boundary.

# Verify
- Validate any added container assets against the owning service or infrastructure configuration.

# Related Areas
- Service runtime boundaries live in `apps/`.
- Shared infrastructure config lives in `infrastructure/`.
