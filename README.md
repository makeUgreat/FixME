# FixME

FixME is a pnpm workspace repository. The current backend application lives in `apps/api`, and future UI code can be added as another workspace app such as `apps/web`.

## Structure

```text
apps/
  api/      # NestJS API application
docs/       # Repository-wide documentation conventions
```

## Setup

```bash
pnpm install
```

For local API runtime values, copy `apps/api/.env.example` to `apps/api/.env`.
`NODE_ENV` is the Node runtime mode and allows `development`, `test`, or
`production`; it defaults to `development`. `APP_ENV` is the API app environment
selector and allows `local`, `development`, `test`, or `production`; it defaults
to `local`.

## Local Adapters

Start local adapter dependencies from the repository root:

```bash
pnpm api:start:local
```

This starts local adapters, runs database migrations, and starts the API dev
server. The local adapter Compose file starts Postgres on `127.0.0.1:5432` and
initializes the corrections database roles used by `apps/api/.env.example`.

Stop local adapter dependencies with:

```bash
pnpm api:stop:local
```

## API Commands

The root scripts are prefixed by app name, so these commands can be run from the repository root:

```bash
pnpm api:start:local
pnpm api:stop:local
pnpm api:start:dev
pnpm api:build
pnpm api:typecheck
pnpm api:lint
pnpm api:test
pnpm api:test:unit
pnpm api:test:integration
pnpm api:test:cov
pnpm api:harness:local
pnpm api:harness:pr
```

You can also run commands directly against the API workspace:

```bash
pnpm --filter @fixme/api start:dev
pnpm --filter @fixme/api test
```

## Adding UI Later

Add the UI as a separate workspace package under `apps/web`. The existing `pnpm-workspace.yaml` already includes `apps/*`, so a future UI package only needs its own `package.json`.

Shared packages can be added under `packages/*` when the repository needs code shared across workspace apps.
