# FixME

FixME는 pnpm workspace 저장소다. 현재 백엔드 애플리케이션은 `apps/api`에 있으며, 향후 UI 코드는 `apps/web` 같은 별도 workspace 앱으로 추가할 수 있다.

## 구조

```text
apps/
  api/      # NestJS API 애플리케이션
docs/       # 저장소 전역 문서 컨벤션
```

## 설정

```bash
pnpm install
```

## API 명령어

루트 스크립트는 앱 이름을 접두어로 사용하므로, 저장소 루트에서 다음 명령을 실행할 수 있다.

```bash
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

API workspace를 직접 대상으로 지정해 명령을 실행할 수도 있다.

```bash
pnpm --filter @fixme/api start:dev
pnpm --filter @fixme/api test
```

## 나중에 UI 추가하기

UI는 `apps/web` 아래 별도 workspace package로 추가한다. 기존 `pnpm-workspace.yaml`이 이미 `apps/*`를 포함하므로, 향후 UI package는 자체 `package.json`만 필요하다.

저장소 안에서 workspace 앱 간 공유 코드가 필요해지면 `packages/*` 아래 shared package를 추가할 수 있다.
