# Purpose
`product-service` should own catalog, inventory, and product-facing listing data.

# Do
- Keep catalog rules, product DTOs, and service-local validation in this app.
- Keep inventory and pricing behavior near the product domain unless a separate service is introduced on purpose.
- Prefer feature folders under `src/app/**` as the service grows beyond the starter scaffold.

# Do Not
- Do not move product-specific error codes or business rules into shared libs.
- Do not let order or payment concerns leak into product logic.
- Do not depend on another app's internal files.

# Verify
- Run `npm exec nx lint product-service`.
- Run `npm exec nx typecheck product-service`.
- Run `npm exec nx test product-service`.
- Run `npm exec nx build product-service`.

# Related Areas
- Public route changes usually require Kong updates in `infrastructure/kong/`.
