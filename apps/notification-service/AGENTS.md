# Purpose
`notification-service` should own outbound delivery such as email, SMS, push, or internal notifications.

# Do
- Keep channel adapters, delivery rules, templates, and retry behavior local to this service.
- Keep notification-specific DTOs and error handling inside the app.
- Prefer feature folders under `src/app/**` when replacing the starter scaffold.

# Do Not
- Do not put generic transport wrappers and NATS client setup here if they belong in `libs/messaging`.
- Do not let other services own notification formatting details through direct source imports.
- Do not move channel-specific business rules into `libs/common`.

# Verify
- Run `npm exec nx lint notification-service`.
- Run `npm exec nx typecheck notification-service`.
- Run `npm exec nx test notification-service`.
- Run `npm exec nx build notification-service`.

# Related Areas
- Shared messaging setup belongs in `libs/messaging`.
- Shared subject definitions may need updates in `infrastructure/nats/`.
