# Purpose
`packages/` is reserved for standalone workspace packages that are neither deployable apps nor shared Nx libs.

# Do
- Use this folder only for genuine package boundaries with their own packaging/runtime reason to exist.
- Keep package metadata and workspace wiring explicit if packages are added here.

# Do Not
- Do not duplicate code that already belongs in `libs/`.
- Do not create placeholder packages without a clear consumer or release boundary.

# Verify
- Confirm workspace package wiring if a new package is introduced.
- Run the relevant package or consumer verification commands after changes.

# Related Areas
- Reusable internal code usually belongs in `libs/`.
