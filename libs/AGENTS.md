# Purpose
`libs/` contains reusable building blocks. Add code here only when it is clearly shared or deliberately foundational.

# Do
- Keep shared APIs explicit through each lib's `src/index.ts`.
- Keep libs small, stable, and focused on one boundary.
- Put reusable technical infrastructure here before copying code across services.
- Verify the changed lib and its direct consumers.

# Do Not
- Do not turn `libs/` into a dump for unfinished service logic.
- Do not move one-service-only business rules here too early.
- Do not expose deep internal files when an index export is enough.

# Verify
- Run `npm exec nx lint <lib>`.
- Run `npm exec nx typecheck <lib>`.
- Run `npm exec nx test <lib>` when the lib has tests.
- Run `npm exec nx build <lib>`.

# Related Areas
- Service consumers live in `apps/`.
- Infra-specific runtime configuration belongs in `infrastructure/`.
