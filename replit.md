# AgentTripwire

Defensive AI-agent trace analysis with six transparent risk detectors, analyst triage, saved cases, evaluation, and incident report export.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract
- `artifacts/api-server/src/lib/agent-tripwire-detector.ts` — inert pattern detector
- `artifacts/api-server/src/routes/agent-tripwire.ts` — API routes, demos, evaluation, export
- `lib/db/src/schema/agent-tripwire.ts` — persisted cases
- `artifacts/sentinel-scope/src/` — AgentTripwire frontend (legacy internal artifact path)

## Architecture decisions

- Detection is deterministic and local: no prompt execution, URL retrieval, model calls, or attacker contact.
- Confidence values communicate rule strength, not calibrated real-world probability.
- Reports escape all trace-derived text before rendering HTML.
- Evaluation metrics are explicitly scoped to a fixed synthetic fixture set.

## Product

Analyze pasted traces or safe demos, review highlighted evidence across six risk classes, triage saved cases, search history, inspect a simulated attack timeline, evaluate false positives, and export a printable incident report.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Re-run OpenAPI codegen after API contract changes.
- Keep all trace analysis inert; never add URL fetching or shell/tool execution to the detector.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
