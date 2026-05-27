# FixME

FixME is a pnpm workspace repository. The current backend application lives in `apps/api`, and future UI code can be added as another workspace app such as `apps/web`.

## Structure

```text
apps/
  api/      # NestJS API application
packages/  # Shared packages can be added here when needed
```

## Setup

```bash
pnpm install
```

## API Commands

The root scripts are prefixed by app name, so these commands can be run from the repository root:

```bash
pnpm api:start:dev
pnpm api:build
pnpm api:typecheck
pnpm api:lint
pnpm api:test
pnpm api:test:e2e
pnpm api:test:cov
```

You can also run commands directly against the API workspace:

```bash
pnpm --filter @fixme/api start:dev
pnpm --filter @fixme/api test
```

## Adding UI Later

Add the UI as a separate workspace package under `apps/web`. The existing `pnpm-workspace.yaml` already includes `apps/*`, so a future UI package only needs its own `package.json`.
