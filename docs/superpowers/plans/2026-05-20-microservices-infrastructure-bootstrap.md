# Microservices Infrastructure Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build reproducible local infrastructure under `infrastructure/` for Kong, NATS, Postgres, and Redis, with Nx targets to validate and operate the stack.

**Architecture:** `infrastructure/` becomes the single source of truth for local platform services. Nx wraps Docker Compose so infra commands run the same way as app commands. Kong keeps the requested split `routes/`, `services/`, and `plugins/` folders, but those fragments are compiled into a single `kong.yml` because DB-less Kong loads one declarative state file at startup. NATS keeps native server config in `nats-server.conf`, while JetStream stream definitions live as operator-managed JSON configs plus a manifest because streams are created through the JetStream API/CLI rather than static server config.

**Tech Stack:** Nx 22 `nx:run-commands`, Docker Compose v2, Kong Gateway DB-less mode, NATS 2.x with JetStream, Postgres 16, Redis 7, Node.js scripts for config assembly.

---

## File Structure

### Create

- `infrastructure/project.json`
- `infrastructure/docker-compose.yml`
- `infrastructure/.env.example`
- `infrastructure/README.md`
- `infrastructure/kong/Dockerfile`
- `infrastructure/kong/kong.yml`
- `infrastructure/kong/scripts/build-kong-config.mjs`
- `infrastructure/kong/routes/auth.routes.yml`
- `infrastructure/kong/routes/user.routes.yml`
- `infrastructure/kong/routes/product.routes.yml`
- `infrastructure/kong/routes/order.routes.yml`
- `infrastructure/kong/routes/payment.routes.yml`
- `infrastructure/kong/services/auth.service.yml`
- `infrastructure/kong/services/user.service.yml`
- `infrastructure/kong/services/product.service.yml`
- `infrastructure/kong/services/order.service.yml`
- `infrastructure/kong/services/payment.service.yml`
- `infrastructure/kong/plugins/cors.yml`
- `infrastructure/kong/plugins/jwt.yml`
- `infrastructure/kong/plugins/rate-limit.yml`
- `infrastructure/kong/plugins/logging.yml`
- `infrastructure/kong/certificates/.gitkeep`
- `infrastructure/nats/Dockerfile`
- `infrastructure/nats/nats-server.conf`
- `infrastructure/nats/subjects/auth.subjects.md`
- `infrastructure/nats/subjects/order.subjects.md`
- `infrastructure/nats/subjects/payment.subjects.md`
- `infrastructure/nats/streams/streams.conf`
- `infrastructure/nats/streams/auth-events.json`
- `infrastructure/nats/streams/order-events.json`
- `infrastructure/nats/streams/payment-events.json`
- `infrastructure/nats/monitoring/prometheus.yml`
- `infrastructure/postgres/init/auth-db.sql`
- `infrastructure/postgres/init/user-db.sql`
- `infrastructure/postgres/init/product-db.sql`
- `infrastructure/postgres/init/order-db.sql`
- `infrastructure/postgres/init/payment-db.sql`
- `infrastructure/postgres/init/notification-db.sql`
- `infrastructure/postgres/backups/.gitkeep`
- `infrastructure/postgres/migrations/.gitkeep`
- `infrastructure/postgres/configs/postgres.conf`
- `infrastructure/redis/redis.conf`
- `infrastructure/redis/Dockerfile`
- `infrastructure/redis/cache/auth-cache.md`
- `infrastructure/redis/cache/product-cache.md`
- `infrastructure/redis/cache/order-cache.md`
- `infrastructure/redis/rate-limit/rate-limit.config.md`
- `infrastructure/redis/sessions/.gitkeep`

### Responsibility Map

- `infrastructure/project.json`: Nx entrypoint for validate, up, down, ps, logs.
- `infrastructure/docker-compose.yml`: Runtime wiring, ports, volumes, networks.
- `infrastructure/.env.example`: Local defaults for ports, secrets, and service URLs.
- `infrastructure/README.md`: Operator runbook for local setup and smoke checks.
- `infrastructure/kong/scripts/build-kong-config.mjs`: Compiles split Kong YAML fragments into `kong.yml`.
- `infrastructure/kong/kong.yml`: Generated DB-less Kong state file used by the container.
- `infrastructure/nats/nats-server.conf`: Core NATS server and JetStream settings.
- `infrastructure/nats/streams/*.json`: JetStream stream definitions consumable by `nats stream add --config`.
- `infrastructure/nats/streams/streams.conf`: Bootstrap manifest listing exact stream commands.
- `infrastructure/postgres/init/*.sql`: One database per service, plus notification DB.
- `infrastructure/redis/*.md`: Key design docs for cache, sessions, and rate limiting.

### Deliberate Constraints

- `notification-service` gets a Postgres database but no Kong route, because it is an internal worker in the current workspace shape.
- Kong plugin file names stay as requested, but file contents hold actual plugin definitions such as `rate-limiting` and `file-log`.
- NATS stream bootstrap needs JSON definitions in addition to `streams.conf`; static server config alone is not enough to create streams.

## Task 1: Scaffold Nx Infra Project And Compose Backbone

**Files:**
- Create: `infrastructure/project.json`
- Create: `infrastructure/docker-compose.yml`
- Create: `infrastructure/.env.example`
- Create: `infrastructure/README.md`
- Create: `infrastructure/kong/certificates/.gitkeep`
- Create: `infrastructure/postgres/backups/.gitkeep`
- Create: `infrastructure/postgres/migrations/.gitkeep`
- Create: `infrastructure/redis/sessions/.gitkeep`

- [ ] **Step 1: Confirm missing infra project**

Run: `npm exec nx run infrastructure:validate`
Expected: FAIL with `Cannot find project 'infrastructure'`.

- [ ] **Step 2: Create the Nx wrapper project**

```json
{
  "name": "infrastructure",
  "root": "infrastructure",
  "projectType": "application",
  "tags": ["type:infrastructure", "scope:platform"],
  "targets": {
    "validate": {
      "executor": "nx:run-commands",
      "options": {
        "cwd": "{workspaceRoot}",
        "commands": [
          "node infrastructure/kong/scripts/build-kong-config.mjs --check",
          "docker compose --env-file infrastructure/.env.example -f infrastructure/docker-compose.yml config"
        ],
        "parallel": false
      }
    },
    "up": {
      "executor": "nx:run-commands",
      "options": {
        "cwd": "{workspaceRoot}",
        "command": "docker compose --env-file infrastructure/.env -f infrastructure/docker-compose.yml up -d --build"
      }
    },
    "down": {
      "executor": "nx:run-commands",
      "options": {
        "cwd": "{workspaceRoot}",
        "command": "docker compose --env-file infrastructure/.env -f infrastructure/docker-compose.yml down --remove-orphans"
      }
    },
    "ps": {
      "executor": "nx:run-commands",
      "options": {
        "cwd": "{workspaceRoot}",
        "command": "docker compose --env-file infrastructure/.env -f infrastructure/docker-compose.yml ps"
      }
    },
    "logs": {
      "executor": "nx:run-commands",
      "options": {
        "cwd": "{workspaceRoot}",
        "command": "docker compose --env-file infrastructure/.env -f infrastructure/docker-compose.yml logs --tail=200"
      }
    }
  }
}
```

- [ ] **Step 3: Create env defaults and compose skeleton**

```dotenv
KONG_PROXY_PORT=8000
KONG_ADMIN_PORT=8001
KONG_PROXY_SSL_PORT=8443
NATS_CLIENT_PORT=4222
NATS_MONITORING_PORT=8222
POSTGRES_PORT=5432
POSTGRES_SUPERUSER=postgres
POSTGRES_SUPERUSER_PASSWORD=postgres
REDIS_PORT=6379
AUTH_SERVICE_URL=http://host.docker.internal:3001
USER_SERVICE_URL=http://host.docker.internal:3002
PRODUCT_SERVICE_URL=http://host.docker.internal:3003
ORDER_SERVICE_URL=http://host.docker.internal:3004
PAYMENT_SERVICE_URL=http://host.docker.internal:3005
```

```yaml
name: ecommerce-infrastructure

services:
  kong:
    build:
      context: ./kong
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /etc/kong/kong.yml
      KONG_PROXY_ACCESS_LOG: /dev/stdout
      KONG_ADMIN_ACCESS_LOG: /dev/stdout
      KONG_PROXY_ERROR_LOG: /dev/stderr
      KONG_ADMIN_ERROR_LOG: /dev/stderr
      KONG_PROXY_LISTEN: 0.0.0.0:8000, 0.0.0.0:8443 ssl
      KONG_ADMIN_LISTEN: 0.0.0.0:8001
    ports:
      - "${KONG_PROXY_PORT:-8000}:8000"
      - "${KONG_ADMIN_PORT:-8001}:8001"
      - "${KONG_PROXY_SSL_PORT:-8443}:8443"
    depends_on:
      - nats
      - postgres
      - redis
    networks:
      - backplane

  nats:
    build:
      context: ./nats
    command: ["-c", "/etc/nats/nats-server.conf"]
    ports:
      - "${NATS_CLIENT_PORT:-4222}:4222"
      - "${NATS_MONITORING_PORT:-8222}:8222"
    volumes:
      - nats-data:/data
    networks:
      - backplane

  postgres:
    image: postgres:16-alpine
    command: ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]
    environment:
      POSTGRES_USER: "${POSTGRES_SUPERUSER:-postgres}"
      POSTGRES_PASSWORD: "${POSTGRES_SUPERUSER_PASSWORD:-postgres}"
      POSTGRES_DB: postgres
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    volumes:
      - ./postgres/init:/docker-entrypoint-initdb.d:ro
      - ./postgres/configs/postgres.conf:/etc/postgresql/postgresql.conf:ro
      - ./postgres/backups:/backups
      - postgres-data:/var/lib/postgresql/data
    networks:
      - backplane

  redis:
    build:
      context: ./redis
    command: ["redis-server", "/usr/local/etc/redis/redis.conf"]
    ports:
      - "${REDIS_PORT:-6379}:6379"
    volumes:
      - redis-data:/data
      - ./redis/sessions:/sessions
    networks:
      - backplane

volumes:
  nats-data:
  postgres-data:
  redis-data:

networks:
  backplane:
    driver: bridge
```

- [ ] **Step 4: Add operator README and placeholder files**

```md
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
```

```text
infrastructure/kong/certificates/.gitkeep
infrastructure/postgres/backups/.gitkeep
infrastructure/postgres/migrations/.gitkeep
infrastructure/redis/sessions/.gitkeep
```

- [ ] **Step 5: Run validation to capture the next missing dependency**

Run: `npm exec nx run infrastructure:validate`
Expected: FAIL because `infrastructure/kong/scripts/build-kong-config.mjs` does not exist yet.

- [ ] **Step 6: Commit**

```bash
git add infrastructure/project.json infrastructure/docker-compose.yml infrastructure/.env.example infrastructure/README.md infrastructure/kong/certificates/.gitkeep infrastructure/postgres/backups/.gitkeep infrastructure/postgres/migrations/.gitkeep infrastructure/redis/sessions/.gitkeep
git commit -m "build: scaffold infrastructure workspace"
```

## Task 2: Build Kong DB-Less Gateway Config

**Files:**
- Create: `infrastructure/kong/scripts/build-kong-config.mjs`
- Create: `infrastructure/kong/Dockerfile`
- Create: `infrastructure/kong/services/auth.service.yml`
- Create: `infrastructure/kong/services/user.service.yml`
- Create: `infrastructure/kong/services/product.service.yml`
- Create: `infrastructure/kong/services/order.service.yml`
- Create: `infrastructure/kong/services/payment.service.yml`
- Create: `infrastructure/kong/routes/auth.routes.yml`
- Create: `infrastructure/kong/routes/user.routes.yml`
- Create: `infrastructure/kong/routes/product.routes.yml`
- Create: `infrastructure/kong/routes/order.routes.yml`
- Create: `infrastructure/kong/routes/payment.routes.yml`
- Create: `infrastructure/kong/plugins/cors.yml`
- Create: `infrastructure/kong/plugins/jwt.yml`
- Create: `infrastructure/kong/plugins/rate-limit.yml`
- Create: `infrastructure/kong/plugins/logging.yml`
- Create: `infrastructure/kong/kong.yml`

- [ ] **Step 1: Verify Kong compiler is the current blocker**

Run: `npm exec nx run infrastructure:validate`
Expected: FAIL with missing file error for `build-kong-config.mjs`.

- [ ] **Step 2: Create the Kong config builder and image**

```js
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const kongRoot = path.resolve(__dirname, '..');
const outputPath = path.join(kongRoot, 'kong.yml');
const checkOnly = process.argv.includes('--check');

const sections = [
  { key: 'services', dir: 'services' },
  { key: 'routes', dir: 'routes' },
  { key: 'plugins', dir: 'plugins' }
];

function indent(value) {
  return value
    .split('\n')
    .map((line) => (line.length > 0 ? `  ${line}` : line))
    .join('\n');
}

async function renderSection(section) {
  const directory = path.join(kongRoot, section.dir);
  const files = (await readdir(directory))
    .filter((file) => file.endsWith('.yml'))
    .sort();

  const chunks = await Promise.all(
    files.map(async (file) => {
      const content = await readFile(path.join(directory, file), 'utf8');
      return content.trim();
    })
  );

  const body = chunks.filter(Boolean).join('\n');
  return `${section.key}:\n${body ? indent(body) : '  []'}`;
}

const renderedSections = await Promise.all(sections.map(renderSection));
const rendered = [
  '_format_version: "3.0"',
  '_transform: true',
  '',
  ...renderedSections.flatMap((section) => [section, ''])
].join('\n').trimEnd() + '\n';

if (checkOnly) {
  let current = '';
  try {
    current = await readFile(outputPath, 'utf8');
  } catch {
    current = '';
  }

  if (current !== rendered) {
    console.error('Kong config is stale. Run: node infrastructure/kong/scripts/build-kong-config.mjs');
    process.exit(1);
  }

  console.log('Kong config is up to date.');
  process.exit(0);
}

await writeFile(outputPath, rendered, 'utf8');
console.log(`Wrote ${path.relative(process.cwd(), outputPath)}`);
```

```dockerfile
FROM kong:3.8

COPY kong.yml /etc/kong/kong.yml
COPY certificates /etc/kong/certificates
```

- [ ] **Step 3: Create Kong service, route, and plugin fragments**

```yaml
# infrastructure/kong/services/auth.service.yml
- name: auth-service
  url: ${AUTH_SERVICE_URL}
  connect_timeout: 60000
  read_timeout: 60000
  write_timeout: 60000

# infrastructure/kong/services/user.service.yml
- name: user-service
  url: ${USER_SERVICE_URL}
  connect_timeout: 60000
  read_timeout: 60000
  write_timeout: 60000

# infrastructure/kong/services/product.service.yml
- name: product-service
  url: ${PRODUCT_SERVICE_URL}
  connect_timeout: 60000
  read_timeout: 60000
  write_timeout: 60000

# infrastructure/kong/services/order.service.yml
- name: order-service
  url: ${ORDER_SERVICE_URL}
  connect_timeout: 60000
  read_timeout: 60000
  write_timeout: 60000

# infrastructure/kong/services/payment.service.yml
- name: payment-service
  url: ${PAYMENT_SERVICE_URL}
  connect_timeout: 60000
  read_timeout: 60000
  write_timeout: 60000
```

```yaml
# infrastructure/kong/routes/auth.routes.yml
- name: auth-route
  service:
    name: auth-service
  methods: [GET, POST, PUT, PATCH, DELETE]
  paths:
    - /api/v1/auth
  strip_path: false

# infrastructure/kong/routes/user.routes.yml
- name: user-route
  service:
    name: user-service
  methods: [GET, POST, PUT, PATCH, DELETE]
  paths:
    - /api/v1/users
  strip_path: false

# infrastructure/kong/routes/product.routes.yml
- name: product-route
  service:
    name: product-service
  methods: [GET, POST, PUT, PATCH, DELETE]
  paths:
    - /api/v1/products
  strip_path: false

# infrastructure/kong/routes/order.routes.yml
- name: order-route
  service:
    name: order-service
  methods: [GET, POST, PUT, PATCH, DELETE]
  paths:
    - /api/v1/orders
  strip_path: false

# infrastructure/kong/routes/payment.routes.yml
- name: payment-route
  service:
    name: payment-service
  methods: [GET, POST, PUT, PATCH, DELETE]
  paths:
    - /api/v1/payments
  strip_path: false
```

```yaml
# infrastructure/kong/plugins/cors.yml
- name: cors
  config:
    origins:
      - http://localhost:3000
    methods:
      - GET
      - POST
      - PUT
      - PATCH
      - DELETE
      - OPTIONS
    headers:
      - Accept
      - Authorization
      - Content-Type
      - Origin
      - X-Request-Id
    exposed_headers:
      - X-Request-Id
    credentials: true
    max_age: 3600

# infrastructure/kong/plugins/jwt.yml
- name: jwt
  route:
    name: user-route
  config:
    claims_to_verify:
      - exp
- name: jwt
  route:
    name: product-route
  config:
    claims_to_verify:
      - exp
- name: jwt
  route:
    name: order-route
  config:
    claims_to_verify:
      - exp
- name: jwt
  route:
    name: payment-route
  config:
    claims_to_verify:
      - exp

# infrastructure/kong/plugins/rate-limit.yml
- name: rate-limiting
  route:
    name: auth-route
  config:
    minute: 120
    policy: local
- name: rate-limiting
  route:
    name: payment-route
  config:
    minute: 60
    policy: local

# infrastructure/kong/plugins/logging.yml
- name: file-log
  config:
    path: /dev/stdout
    reopen: false
```

- [ ] **Step 4: Generate the final Kong state file**

Run: `node infrastructure/kong/scripts/build-kong-config.mjs`
Expected: PASS with `Wrote infrastructure\kong\kong.yml`.

- [ ] **Step 5: Re-run validation**

Run: `npm exec nx run infrastructure:validate`
Expected: PASS because Kong state is current and Docker Compose model resolves.

Run: `npm exec nx run infrastructure:up`
Expected: FAIL during image build or container startup because NATS, Postgres, and Redis files are still incomplete.

- [ ] **Step 6: Commit**

```bash
git add infrastructure/kong/Dockerfile infrastructure/kong/kong.yml infrastructure/kong/scripts/build-kong-config.mjs infrastructure/kong/routes infrastructure/kong/services infrastructure/kong/plugins
git commit -m "feat: add kong infrastructure config"
```

## Task 3: Configure NATS And JetStream Contracts

**Files:**
- Create: `infrastructure/nats/Dockerfile`
- Create: `infrastructure/nats/nats-server.conf`
- Create: `infrastructure/nats/subjects/auth.subjects.md`
- Create: `infrastructure/nats/subjects/order.subjects.md`
- Create: `infrastructure/nats/subjects/payment.subjects.md`
- Create: `infrastructure/nats/streams/streams.conf`
- Create: `infrastructure/nats/streams/auth-events.json`
- Create: `infrastructure/nats/streams/order-events.json`
- Create: `infrastructure/nats/streams/payment-events.json`
- Create: `infrastructure/nats/monitoring/prometheus.yml`

- [ ] **Step 1: Confirm NATS files are now the main missing piece**

Run: `npm exec nx run infrastructure:up`
Expected: FAIL while building or starting `nats`, before the rest of the stack can become healthy.

- [ ] **Step 2: Create the NATS server image and server config**

```dockerfile
FROM nats:2.10-alpine

COPY nats-server.conf /etc/nats/nats-server.conf
```

```conf
server_name: ecommerce-nats
port: 4222
http_port: 8222

jetstream {
  store_dir: /data/jetstream
  max_mem: 1G
  max_file: 10G
}
```

- [ ] **Step 3: Create subject docs and stream definitions**

```md
# infrastructure/nats/subjects/auth.subjects.md

- `auth.command.register`
- `auth.command.login`
- `auth.event.user-registered`
- `auth.event.user-logged-in`
- `auth.event.token-refreshed`

# infrastructure/nats/subjects/order.subjects.md

- `order.command.create`
- `order.command.cancel`
- `order.event.created`
- `order.event.cancelled`
- `order.event.paid`

# infrastructure/nats/subjects/payment.subjects.md

- `payment.command.authorize`
- `payment.command.capture`
- `payment.event.authorized`
- `payment.event.captured`
- `payment.event.failed`
```

```json
{
  "name": "AUTH_EVENTS",
  "subjects": ["auth.event.*"],
  "retention": "limits",
  "storage": "file",
  "num_replicas": 1
}
```

```json
{
  "name": "ORDER_EVENTS",
  "subjects": ["order.event.*"],
  "retention": "limits",
  "storage": "file",
  "num_replicas": 1
}
```

```json
{
  "name": "PAYMENT_EVENTS",
  "subjects": ["payment.event.*"],
  "retention": "limits",
  "storage": "file",
  "num_replicas": 1
}
```

```conf
nats --server nats://localhost:4222 stream add --config infrastructure/nats/streams/auth-events.json
nats --server nats://localhost:4222 stream add --config infrastructure/nats/streams/order-events.json
nats --server nats://localhost:4222 stream add --config infrastructure/nats/streams/payment-events.json
```

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: nats
    static_configs:
      - targets:
          - nats:8222
```

- [ ] **Step 4: Validate compose again**

Run: `npm exec nx run infrastructure:validate`
Expected: PASS.

Run: `npm exec nx run infrastructure:up`
Expected: FAIL later in startup because Postgres and Redis inputs are still incomplete.

- [ ] **Step 5: Commit**

```bash
git add infrastructure/nats
git commit -m "feat: add nats infrastructure config"
```

## Task 4: Bootstrap Postgres Databases Per Service

**Files:**
- Create: `infrastructure/postgres/init/auth-db.sql`
- Create: `infrastructure/postgres/init/user-db.sql`
- Create: `infrastructure/postgres/init/product-db.sql`
- Create: `infrastructure/postgres/init/order-db.sql`
- Create: `infrastructure/postgres/init/payment-db.sql`
- Create: `infrastructure/postgres/init/notification-db.sql`
- Create: `infrastructure/postgres/configs/postgres.conf`

- [ ] **Step 1: Verify Postgres config is the next missing dependency**

Run: `npm exec nx run infrastructure:up`
Expected: FAIL because `postgres` cannot start cleanly without `infrastructure/postgres/configs/postgres.conf` and init SQL files.

- [ ] **Step 2: Create the Postgres runtime config**

```conf
listen_addresses = '*'
max_connections = 200
shared_buffers = 256MB
wal_level = replica
log_statement = 'ddl'
log_connections = on
log_disconnections = on
```

- [ ] **Step 3: Create database bootstrap SQL files**

```sql
-- infrastructure/postgres/init/auth-db.sql
CREATE USER auth_service WITH ENCRYPTED PASSWORD 'auth_service_password';
CREATE DATABASE auth_service OWNER auth_service;
GRANT ALL PRIVILEGES ON DATABASE auth_service TO auth_service;

-- infrastructure/postgres/init/user-db.sql
CREATE USER user_service WITH ENCRYPTED PASSWORD 'user_service_password';
CREATE DATABASE user_service OWNER user_service;
GRANT ALL PRIVILEGES ON DATABASE user_service TO user_service;

-- infrastructure/postgres/init/product-db.sql
CREATE USER product_service WITH ENCRYPTED PASSWORD 'product_service_password';
CREATE DATABASE product_service OWNER product_service;
GRANT ALL PRIVILEGES ON DATABASE product_service TO product_service;

-- infrastructure/postgres/init/order-db.sql
CREATE USER order_service WITH ENCRYPTED PASSWORD 'order_service_password';
CREATE DATABASE order_service OWNER order_service;
GRANT ALL PRIVILEGES ON DATABASE order_service TO order_service;

-- infrastructure/postgres/init/payment-db.sql
CREATE USER payment_service WITH ENCRYPTED PASSWORD 'payment_service_password';
CREATE DATABASE payment_service OWNER payment_service;
GRANT ALL PRIVILEGES ON DATABASE payment_service TO payment_service;

-- infrastructure/postgres/init/notification-db.sql
CREATE USER notification_service WITH ENCRYPTED PASSWORD 'notification_service_password';
CREATE DATABASE notification_service OWNER notification_service;
GRANT ALL PRIVILEGES ON DATABASE notification_service TO notification_service;
```

- [ ] **Step 4: Validate the compose model**

Run: `npm exec nx run infrastructure:validate`
Expected: PASS.

Run: `npm exec nx run infrastructure:up`
Expected: FAIL later in startup because Redis files are still missing.

- [ ] **Step 5: Commit**

```bash
git add infrastructure/postgres/init infrastructure/postgres/configs/postgres.conf
git commit -m "feat: add postgres bootstrap config"
```

## Task 5: Configure Redis For Cache, Sessions, And Rate Limiting

**Files:**
- Create: `infrastructure/redis/Dockerfile`
- Create: `infrastructure/redis/redis.conf`
- Create: `infrastructure/redis/cache/auth-cache.md`
- Create: `infrastructure/redis/cache/product-cache.md`
- Create: `infrastructure/redis/cache/order-cache.md`
- Create: `infrastructure/redis/rate-limit/rate-limit.config.md`

- [ ] **Step 1: Confirm Redis is the last missing runtime input**

Run: `npm exec nx run infrastructure:up`
Expected: FAIL while building or starting `redis`.

- [ ] **Step 2: Create the Redis image and runtime config**

```dockerfile
FROM redis:7.4-alpine

COPY redis.conf /usr/local/etc/redis/redis.conf
```

```conf
bind 0.0.0.0
port 6379
appendonly yes
appendfsync everysec
save 60 1000
maxmemory 256mb
maxmemory-policy allkeys-lru
```

- [ ] **Step 3: Document Redis keyspaces**

```md
# infrastructure/redis/cache/auth-cache.md

- Prefix: `auth:profile:`
- TTL: `900` seconds
- Use for: cached identity and profile reads

# infrastructure/redis/cache/product-cache.md

- Prefix: `product:detail:`
- TTL: `300` seconds
- Use for: catalog and product detail reads

# infrastructure/redis/cache/order-cache.md

- Prefix: `order:summary:`
- TTL: `120` seconds
- Use for: recent order summaries and dashboard widgets

# infrastructure/redis/rate-limit/rate-limit.config.md

- Prefix: `ratelimit:`
- Window: `60` seconds
- Auth route limit: `120` requests per minute
- Payment route limit: `60` requests per minute
- Kong policy: `local` until a shared Redis-backed policy is introduced later
```

- [ ] **Step 4: Validate the full stack model**

Run: `npm exec nx run infrastructure:validate`
Expected: PASS. `docker compose ... config` renders cleanly, and Kong config check reports up to date.

Run: `npm exec nx run infrastructure:up`
Expected: PASS with all four infrastructure containers starting.

- [ ] **Step 5: Commit**

```bash
git add infrastructure/redis
git commit -m "feat: add redis infrastructure config"
```

## Task 6: Smoke-Test The Stack And Finalize Runbook

**Files:**
- Modify: `infrastructure/README.md`
- Modify: `infrastructure/.env.example`

- [ ] **Step 1: Add final smoke-test section to the runbook**

```md
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
```

- [ ] **Step 2: Tighten env docs so copied secrets are obvious**

```dotenv
# Copy this file to infrastructure/.env before running "npm exec nx run infrastructure:up".
# Change service URLs if backend apps run on ports other than 3001-3005.
KONG_PROXY_PORT=8000
KONG_ADMIN_PORT=8001
KONG_PROXY_SSL_PORT=8443
NATS_CLIENT_PORT=4222
NATS_MONITORING_PORT=8222
POSTGRES_PORT=5432
POSTGRES_SUPERUSER=postgres
POSTGRES_SUPERUSER_PASSWORD=postgres
REDIS_PORT=6379
AUTH_SERVICE_URL=http://host.docker.internal:3001
USER_SERVICE_URL=http://host.docker.internal:3002
PRODUCT_SERVICE_URL=http://host.docker.internal:3003
ORDER_SERVICE_URL=http://host.docker.internal:3004
PAYMENT_SERVICE_URL=http://host.docker.internal:3005
```

- [ ] **Step 3: Run the smoke workflow**

Run: `node infrastructure/kong/scripts/build-kong-config.mjs`
Expected: PASS with generated `infrastructure/kong/kong.yml`.

Run: `npm exec nx run infrastructure:validate`
Expected: PASS.

Run: `npm exec nx run infrastructure:up`
Expected: PASS with four containers starting: `kong`, `nats`, `postgres`, `redis`.

Run: `npm exec nx run infrastructure:ps`
Expected: PASS with all containers listed as running.

- [ ] **Step 4: Commit**

```bash
git add infrastructure/README.md infrastructure/.env.example
git commit -m "docs: add infrastructure smoke test"
```

## Self-Review

- Spec coverage: requested Kong, NATS, Postgres, Redis structure is covered. Two necessary additions are called out explicitly: `infrastructure/docker-compose.yml` and Kong/NATS helper artifacts needed to make the requested split layout runnable.
- Placeholder scan: no `TODO`, `TBD`, or "handle later" text remains in the implementation steps.
- Type consistency: service names, route names, ports, and file paths stay consistent across compose, Kong fragments, and docs.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-20-microservices-infrastructure-bootstrap.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
