# Purpose
`libs/messaging` owns shared NATS transport setup, message-publisher abstractions, and messaging config helpers.

# Do
- Keep this lib focused on transport concerns such as options, wiring, and common publisher interfaces.
- Keep the public API thin and easy for services to consume.
- Align shared messaging options with broker config in `infrastructure/nats/`.

# Do Not
- Do not place service-specific event payload rules or one-domain business workflows here.
- Do not let subject naming conventions drift away from documented/shared infrastructure config.
- Do not add support for other brokers unless that expansion is intentional.

# Verify
- Run `npm exec nx lint messaging`.
- Run `npm exec nx typecheck messaging`.
- Run `npm exec nx test messaging`.
- Run `npm exec nx build messaging`.

# Related Areas
- Shared broker config and stream definitions live in `infrastructure/nats/`.
- Service publishers and consumers live in `apps/*`.
