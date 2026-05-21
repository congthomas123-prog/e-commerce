# Purpose
`order-service` should own order lifecycle state, checkout progression, and order persistence.

# Do
- Keep order-state transitions, order DTOs, and order-specific error codes local to this service.
- Keep orchestration code here even when it coordinates product, payment, or notification work.
- Prefer feature folders under `src/app/**` over flat starter files.

# Do Not
- Do not move order domain rules into `libs/common`.
- Do not let payment-provider implementation details define order boundaries.
- Do not couple directly to sibling app internals.

# Verify
- Run `npm exec nx lint order-service`.
- Run `npm exec nx typecheck order-service`.
- Run `npm exec nx test order-service`.
- Run `npm exec nx build order-service`.

# Related Areas
- Public route changes usually require Kong updates in `infrastructure/kong/`.
- Event contracts, if shared, should be coordinated with `libs/messaging` and `infrastructure/nats/`.
