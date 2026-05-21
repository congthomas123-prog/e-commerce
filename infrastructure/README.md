# Infrastructure

Local infrastructure for the Nx microservices workspace.

## Prerequisites

- Docker Desktop with Compose v2
- Node.js version already used by the workspace

## First-time setup

1. Copy `infrastructure/.env.example` to `infrastructure/.env`.
2. Run `node infrastructure/kong/scripts/build-kong-config.mjs`.
3. Run `npm exec nx run infrastructure:validate`.
4. Run `npm exec nx run infrastructure:up`.

## Daily commands

- Validate config: `npm exec nx run infrastructure:validate`
- Start stack: `npm exec nx run infrastructure:up`
- Inspect containers: `npm exec nx run infrastructure:ps`
- Tail logs: `npm exec nx run infrastructure:logs`
- Stop stack: `npm exec nx run infrastructure:down`

## Public entrypoints

- Kong proxy: `http://localhost:8000`
- Kong admin: `http://localhost:8001`
- NATS client: `nats://localhost:4222`
- NATS monitoring: `http://localhost:8222`
- Postgres: `postgres://postgres:postgres@localhost:5432/postgres`
- Redis: `redis://localhost:6379`

## Smoke test

1. Copy `infrastructure/.env.example` to `infrastructure/.env`.
2. Run `node infrastructure/kong/scripts/build-kong-config.mjs`.
3. Run `npm exec nx run infrastructure:validate`.
4. Run `npm exec nx run infrastructure:up`.
5. Run `npm exec nx run infrastructure:ps`.
6. Confirm Kong responds on `http://localhost:8001`.
7. Confirm NATS monitoring responds on `http://localhost:8222`.
8. Confirm Postgres accepts connections on `localhost:5432`.
9. Confirm Redis accepts connections on `localhost:6379`.
10. If the `nats` CLI is installed locally, apply streams:
    - `nats --server nats://localhost:4222 stream add --config infrastructure/nats/streams/auth-events.json`
    - `nats --server nats://localhost:4222 stream add --config infrastructure/nats/streams/order-events.json`
    - `nats --server nats://localhost:4222 stream add --config infrastructure/nats/streams/payment-events.json`
11. Run `npm exec nx run infrastructure:down` when finished.
