# Rate Limit Config

- Prefix: `ratelimit:`
- Window: `60` seconds
- Auth route limit: `120` requests per minute
- Payment route limit: `60` requests per minute
- Kong policy: `local` until a shared Redis-backed policy is introduced later
