# Project Overview For AI Agents

## Purpose
This repository is an Nx monorepo for an e-commerce microservices system.

Main boundaries:
- `apps/`: deployable services
- `libs/`: shared reusable code
- `infrastructure/`: gateway, broker, database, cache, and runtime config
- `docs/`: plans and human/agent documentation

Use this file as the fast onboarding map when entering a new context.

## Core Mental Model
Use this rule first:

```text
apps = business behavior
libs = shared technical building blocks
infrastructure = runtime and platform wiring
docs = plans, explanations, and references
```

If searching for real business logic, start in `apps/`, not `libs/`.

## Folder Map

### `apps/`
Each folder in `apps/` is a service boundary.

Current services:
- `auth-service`
- `user-service`
- `product-service`
- `order-service`
- `payment-service`
- `notification-service`

General expectation inside a service:

```text
src/app/controller    -> transport entrypoint
src/app/service       -> business logic
src/app/dto           -> request validation
src/app/constants     -> service-specific error codes/constants
src/app/types         -> local payload/response types
prisma/               -> app-owned schema if the service owns data
```

Important rule:
- service-specific business logic should stay inside the owning app
- do not move one-service-only logic into shared libs too early

### `libs/`
Shared code lives here.

Current libraries:
- `libs/common`
- `libs/database`
- `libs/messaging`
- `libs/auth`

High-level ownership:
- `common`: shared response envelope, exception filters, validation helpers, generic utilities
- `database`: Prisma lifecycle/module wiring, database config helpers
- `messaging`: NATS transport wiring and publisher abstractions
- `auth`: reserved for shared auth contracts/helpers when there is a real second consumer

Important rule:
- `libs/` is not the default location for business logic
- add code here only when it is clearly shared or foundational

### `infrastructure/`
Environment and platform config lives here.

Current infrastructure areas:
- `infrastructure/kong`
- `infrastructure/postgres`
- `infrastructure/nats`
- `infrastructure/redis`

High-level ownership:
- `kong`: API gateway routes, upstream services, plugins, generated gateway config
- `postgres`: bootstrap SQL, server config, database setup
- `nats`: broker config, stream definitions, subject docs
- `redis`: cache/session/rate-limit runtime notes and config

Important rule:
- infrastructure is not where business rules should live
- if a route, subject, port, or database name changes, check the owning app too

## Where To Find Business Logic

### First search rule
If the question is:
- "How does login work?"
- "Where is order creation?"
- "Where is product validation?"
- "Where does payment status change?"

Start here:

```text
apps/<service>/src/app/**
```

Do not start in `libs/common` unless the question is about shared validation, shared response format, or shared exception behavior.

### Current implemented example: auth
Main auth logic lives in:
- [apps/auth-service/src/app/auth](C:/Users/thanh/Desktop/Learning/microservices-ecommerce/apps/auth-service/src/app/auth)

Useful files:
- [auth.controller.ts](C:/Users/thanh/Desktop/Learning/microservices-ecommerce/apps/auth-service/src/app/auth/auth.controller.ts): HTTP endpoints
- [auth.service.ts](C:/Users/thanh/Desktop/Learning/microservices-ecommerce/apps/auth-service/src/app/auth/auth.service.ts): core register/login/refresh logic
- [dto/](C:/Users/thanh/Desktop/Learning/microservices-ecommerce/apps/auth-service/src/app/auth/dto): request validation
- [services/auth-token.service.ts](C:/Users/thanh/Desktop/Learning/microservices-ecommerce/apps/auth-service/src/app/auth/services/auth-token.service.ts): JWT issuing/verifying
- [services/password.service.ts](C:/Users/thanh/Desktop/Learning/microservices-ecommerce/apps/auth-service/src/app/auth/services/password.service.ts): hash/compare helpers
- [constants/](C:/Users/thanh/Desktop/Learning/microservices-ecommerce/apps/auth-service/src/app/auth/constants): auth-specific error codes
- [prisma/schema.prisma](C:/Users/thanh/Desktop/Learning/microservices-ecommerce/apps/auth-service/prisma/schema.prisma): auth-owned persistence schema

### Expected future pattern for all services
As other services move beyond starter scaffold, use this lookup pattern:

1. find target service in `apps/`
2. open `src/app/`
3. locate feature folder
4. read controller for entrypoints
5. read service for business rules
6. read DTO/constants/types for validation and service-local contracts
7. read `prisma/` if persistence ownership matters

## Where Not To Look

### `libs/common`
Do look here for:
- success/error response shape
- shared exception filters
- shared validation helpers
- tiny generic utils

Do not expect here:
- login rules
- order state machine
- payment retry policy
- product inventory business rules

### `libs/database`
Do look here for:
- database module wiring
- Prisma lifecycle behavior
- database URL helper/config

Do not expect here:
- app schema ownership
- domain repositories for a single service
- auth/user/order business rules

### `libs/messaging`
Do look here for:
- NATS module wiring
- publisher abstraction
- shared messaging config

Do not expect here:
- domain event business rules
- service orchestration
- app-specific payload decisions unless truly shared

### `infrastructure/*`
Do look here for:
- gateway paths
- broker subjects/streams
- bootstrap databases
- redis/cache runtime config

Do not expect here:
- the main implementation of register/login/order/payment workflows

## How To Trace A Feature

### HTTP feature
Example pattern:

```text
Kong route
  -> app controller
  -> app service
  -> local helpers / Prisma / messaging
```

For auth:

```text
/api/auth/login
  -> auth.controller.ts
  -> auth.service.ts
  -> password.service.ts + auth-token.service.ts + PrismaService
```

### Shared technical behavior
If the question is:
- "Why is every response wrapped?"
- "Why does validation reject this field?"
- "Why does error JSON look like this?"

Then inspect:
- `libs/common`

### Persistence ownership
If the question is:
- "Which service owns this table/model?"
- "Where is schema defined?"

Then inspect:
- the owning app's `prisma/` folder first
- not `libs/database`

### Messaging ownership
If the question is:
- "How does NATS client get configured?"

Then inspect:
- `libs/messaging`

If the question is:
- "Which subject/event should order publish?"

Then inspect:
- the owning service
- then `infrastructure/nats/subjects`
- then `infrastructure/nats/streams`

## Current State Snapshot

### Most complete service
`auth-service` is currently the strongest implementation reference.

It already shows:
- feature-folder structure
- DTO validation
- auth-specific error codes
- local Prisma schema ownership
- shared `libs/common` response/error integration
- shared `libs/database` runtime wiring

### Starter/scaffold services
Some other services may still be close to Nest starter shape.

When that happens:
- treat the service boundary as real
- but assume detailed business logic is not implemented yet
- use `auth-service` as the reference pattern for structure

## Fast Triage Guide For AI

If user asks about:
- authentication: start in `apps/auth-service`
- shared response shape: start in `libs/common`
- Prisma lifecycle/module setup: start in `libs/database`
- NATS client setup: start in `libs/messaging`
- API gateway path/routing: start in `infrastructure/kong`
- database bootstrap/config: start in `infrastructure/postgres`
- stream/subject config: start in `infrastructure/nats`
- cache/session/rate-limit runtime config: start in `infrastructure/redis`

## Practical Rules
- Prefer the nearest owning boundary over the most generic folder.
- Business logic belongs to apps unless there is clear cross-service reuse.
- Shared libs should stay small and stable.
- Infrastructure config may affect many services; treat edits there as cross-service changes.
- Read local `AGENTS.md` files after this overview for boundary-specific rules.

## Read Order For New Context
Recommended order:

1. [AGENTS.md](C:/Users/thanh/Desktop/Learning/microservices-ecommerce/AGENTS.md)
2. this file
3. target boundary `AGENTS.md`
4. target service or lib source files

If the task is business behavior, jump to `apps/` early.
