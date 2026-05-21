# Purpose
`libs/common` owns shared response envelopes, exception mapping, validation helpers, and small generic utilities.

# Do
- Keep this lib transport-safe for HTTP and RPC usage where possible.
- Keep shared error codes here only when they are generic and reusable across services.
- Keep utilities truly generic, small, and framework-light.
- Update tests when response or error envelope shape changes.

# Do Not
- Do not place auth-, order-, product-, or payment-specific business rules here.
- Do not add domain-specific error codes that only one service understands.
- Do not grow this lib into a catch-all for unrelated helpers.

# Verify
- Run `npm exec nx lint common`.
- Run `npm exec nx typecheck common`.
- Run `npm exec nx test common`.
- Run `npm exec nx build common`.

# Related Areas
- Service-local business codes stay inside `apps/*`.
- Shared validation consumers live across `apps/`.
