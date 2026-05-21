# Purpose
`infrastructure/kong` owns API gateway services, routes, plugins, and generated Kong declarative config.

# Do
- Treat `routes/`, `services/`, and `plugins/` as the source-of-truth inputs.
- Rebuild or check `kong.yml` after editing source fragments.
- Keep upstream service names, ports, and public paths aligned with the owning app.

# Do Not
- Do not hand-edit `kong.yml` as the primary source when the build script can regenerate it.
- Do not change external route prefixes without checking the app controller/global prefix.
- Do not add plugin config that conflicts with service auth or rate-limit expectations without coordination.

# Verify
- Run `node infrastructure/kong/scripts/build-kong-config.mjs`.
- Run `node infrastructure/kong/scripts/build-kong-config.mjs --check`.

# Related Areas
- Public HTTP path changes usually come from `apps/*`.
