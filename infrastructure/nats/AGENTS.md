# Purpose
`infrastructure/nats` owns broker config, shared stream definitions, and documented subject conventions.

# Do
- Keep stream JSON, `streams.conf`, and subject docs aligned.
- Treat subject naming as a cross-service contract.
- Update service publishers/consumers when stream or subject contracts change.

# Do Not
- Do not place service business orchestration here.
- Do not change subject names in one place only.
- Do not add broker-level behavior that `libs/messaging` cannot reasonably consume.

# Verify
- Review `streams/`, `subjects/`, and broker config together when touching message topology.
- Re-run affected service tests/builds when changing subjects or stream expectations.

# Related Areas
- Shared transport client code lives in `libs/messaging`.
- Event producers and consumers live in `apps/*`.
