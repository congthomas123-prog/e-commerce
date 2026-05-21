# Purpose
`payment-service` should own payment transactions, provider integration points, and payment-status handling.

# Do
- Keep payment-specific DTOs, provider adapters, and transaction rules inside this service.
- Keep provider credentials and secrets configuration local to this app.
- Prefer feature folders under `src/app/**` as real payment flows are added.

# Do Not
- Do not push payment-provider behavior into `libs/common`.
- Do not let payment logic take ownership of order lifecycle rules.
- Do not depend on sibling app source files.

# Verify
- Run `npm exec nx lint payment-service`.
- Run `npm exec nx typecheck payment-service`.
- Run `npm exec nx test payment-service`.
- Run `npm exec nx build payment-service`.

# Related Areas
- Public route changes usually require Kong updates in `infrastructure/kong/`.
- Shared event transport concerns belong in `libs/messaging`, not payment business rules.
