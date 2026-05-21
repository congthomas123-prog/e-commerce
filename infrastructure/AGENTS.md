# Purpose
`infrastructure/` contains shared runtime and deployment-adjacent configuration that can affect multiple services at once.

# Do
- Treat changes here as cross-service changes with wider blast radius.
- Keep ports, hostnames, route prefixes, and infra resource names aligned with app configuration.
- Regenerate derived configuration files when the source fragments change.

# Do Not
- Do not hide service business rules inside infrastructure config.
- Do not update generated files without also updating the source fragments that own them.
- Do not assume infra-only edits are isolated from application behavior.

# Verify
- Run local checks for the touched infra area.
- Re-run affected app Nx tasks when infra changes alter routes, ports, or contracts.

# Related Areas
- Service consumers live in `apps/`.
- Shared runtime helper libs live in `libs/`.
