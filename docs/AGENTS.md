# Purpose
`docs/` contains plans, references, and supporting documentation for the monorepo.

# Do
- Keep architecture notes, runbooks, and planning artifacts here.
- Add new docs when behavior changes materially or when new operational knowledge is introduced.
- Keep dated planning artifacts additive rather than rewriting history in place.

# Do Not
- Do not let docs become the only source of truth when code or config already defines behavior.
- Do not silently change historical plan documents to describe a different implementation outcome.

# Verify
- Check linked file paths and command examples after editing docs.
- Update related code/config in the same change when docs describe current behavior.

# Related Areas
- Implementation details live in `apps/`, `libs/`, and `infrastructure/`.
