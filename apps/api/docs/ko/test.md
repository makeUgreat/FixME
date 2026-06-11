---
title: API 테스트 컨벤션
lang: ko
audience: both
applies_to:
  - apps/api
source: ../en/test.md
last_synced: 2026-06-11
related:
  - ./index.md
---

# 테스트 컨벤션

API 앱은 Vitest를 사용하며 단위 테스트와 통합 테스트를 분리한다. 실행 속도와 검증 범위를 기준으로 단위 테스트를 먼저 선호한다. 프레임워크 설정, 모듈 연결, Nest 애플리케이션 부트스트랩, 라우팅, 실제 HTTP 응답처럼 여러 실제 컴포넌트가 함께 동작하는지 검증해야 할 때 통합 테스트를 작성한다.

현재 활성화된 테스트 컨벤션 ESLint 검사는 없다.

## 공통 리뷰 규칙

- 테스트 종류에 맞는 표준 디렉터리를 사용한다. 단위 테스트는 대상 파일이 있는 디렉터리의 `__tests__` 아래에 두고, 통합 테스트는 `apps/api/test/{context}/` 아래의 architecture path에 맞춰 둔다.
- `describe()`에는 테스트 대상 이름을 사용한다.
- 각 `it()`는 하나의 작업 단위를 호출하고 하나의 구체적인 동작 결과를 검증해야 한다.
- 상태 코드, 본문, 헤더가 같은 실행 결과를 검증한다면 같은 `it()` 안에서 assertion한다.
- 성공, 실패, 예외, 경계값, 인증/인가, validation처럼 실행 경로나 기대 결과가 다르면 `it()` 블록을 나눈다.
- 비동기 동작은 `async/await` 또는 Vitest `resolves`/`rejects` matcher로 명확히 검증한다.
- 테스트 사이에 상태를 공유하지 않는다. 공유 리소스가 필요하면 `beforeEach`에서 만들고 `afterEach`에서 정리한다.
- 테스트는 같은 조건에서 항상 같은 결과를 내야 한다.
- 기반 클래스, 추상 클래스, 공유 헬퍼가 제공하는 공통 계약은 해당 공통 대상의 테스트 파일에서 검증한다. 구체 클래스 테스트는 구체 클래스 자신의 규칙, validation, 조합, error case에 집중한다.
- 구체 클래스가 공통 동작을 override하거나 조합 방식 때문에 관찰 가능한 결과가 달라진다면, 그 구체 동작은 구체 클래스 테스트에서 검증한다.

## 단위 테스트

- 단위 테스트는 `pnpm api:test:unit`으로 실행한다.
- 단위 테스트는 테스트 대상 파일이 있는 디렉터리 안의 `__tests__` 디렉터리에 둔다. 예: `apps/api/src/contexts/corrections/domain/__tests__/mistake.vo.spec.ts`
- 순수 서비스, 함수, 작은 비즈니스 로직 단위를 대상으로 한다.
- HTTP 서버, 실제 Nest 애플리케이션 부트스트랩, 외부 I/O를 사용하지 않는다.
- 필요한 dependency는 직접 만들거나 가벼운 mock/stub으로 대체한다.
- DI 설정을 검증해야 할 때만 Nest testing module을 사용한다.
- 작업 단위는 entry point 호출부터 관찰 가능한 동작 결과까지의 흐름이다.
- entry point는 보통 public method 또는 function call이다.
- 동작 결과는 return value, thrown exception, state change, dependency call 중 하나다.
- 바깥 `describe()`는 테스트 대상 단위여야 한다. 예: `describe('MetricsService')`
- 안쪽 `describe()`는 method 또는 주요 public API여야 한다. 예: `describe('getMetrics')`
- 각 `it()`는 해당 method의 조건 하나와 동작 결과 하나를 다뤄야 한다.
- return value, exception, state change, dependency call은 서로 다른 결과 유형이므로 별도 `it()` 블록에서 테스트한다.
- dependency는 파일 시스템, 네트워크, 데이터베이스, 외부 팀 코드, 느린 계산처럼 단위 테스트에서 완전히 통제할 수 없는 모든 것을 뜻한다.
- 필요하면 dependency를 stub으로 대체하되, dependency call을 검증하는 테스트는 최소화한다.

## 통합 테스트

- Postgres가 필요 없는 통합 테스트는 `pnpm api:test:integration`으로 실행한다.
- Postgres 기반 통합 테스트는 `pnpm api:test:integration:postgres`로 실행한다.
- 모든 통합 테스트는 `pnpm api:test:integration:all`로 실행한다.
- config-to-rule wiring, dependency injection wiring, framework bootstrap, routing, controller response처럼 단위 테스트로 다룰 수 없는 상호작용을 검증할 때 통합 테스트를 사용한다.
- 실제 네트워크, REST API, 시스템 시간, 파일 시스템, 데이터베이스처럼 통제하기 어려운 요소를 사용하는 테스트는 단위 테스트가 아니라 통합 테스트로 분리한다.
- 통합 테스트는 외부 protocol 또는 persistence와 맞닿은 boundary adapter의 계약 테스트로 본다.
- Integration spec file은 context와 architecture layer별로 분리한다. 예: HTTP controller adapter는 `test/corrections/presentation/corrections-http.controller.integration-spec.ts`, memory repository adapter는 `test/corrections/infrastructure/persistence/correction.repository.memory.integration-spec.ts`, Postgres Drizzle repository adapter는 `test/corrections/infrastructure/persistence/correction.repository.postgres-drizzle.integration-spec.ts`를 사용한다.
- `infrastructure/persistence` 아래에는 adapter별 추가 디렉터리를 만들지 않는다. Persistence adapter 이름은 spec file name에 넣는다.
- 모든 domain 또는 application invariant를 통합 테스트에서 반복하지 않는다. 상세한 domain/application rule은 단위 테스트에 두고, 통합 테스트는 request/response shape, validation pipe 동작, dependency injection wiring, framework routing, repository save/find contract처럼 boundary에서 관찰 가능한 동작을 검증한다.
- Nest 앱 통합 테스트는 표준 Fastify 요청 방식으로 `app.inject()`를 사용한다.
- Nest 앱 통합 테스트 파일은 `beforeEach`에서 app을 만들고 `afterEach`에서 `app.close()`로 닫아야 한다.
- 바깥 `describe()`는 통합 대상 이름을 지정해야 한다.
- 라우트 테스트에서는 안쪽 `describe()`가 controller method와 route를 나타내야 한다. 예: `describe('GET /metrics')`
- 각 `it()`는 하나의 요청 조건 또는 통합 조건과 하나의 기대 결과를 다뤄야 한다.
- 성공 응답, bad request, authentication/authorization failure, not found, server error처럼 HTTP 결과가 다르면 `it()` 블록을 나눈다.
- HTTP 상태 코드, 응답 본문, 중요한 헤더를 함께 검증한다.

## 통합 테스트 Fixture

- 한 spec file에서만 사용하는 fixture builder는 spec file 안에서 시작한다.
- 두 개 이상의 integration spec이 같은 valid aggregate, value object, command, request payload를 필요로 하면 반복되는 context-level fixture를 `apps/api/test/{context}/fixtures/`로 옮긴다.
- Fixture builder 이름은 생성하는 object 기준으로 짓는다. 예: `createCorrectionFixture`.
- Fixture builder는 기본적으로 valid object를 반환해야 하며, 테스트에서 중요한 field는 명시적으로 override할 수 있게 SHOULD 제공한다.
- Fixture 기본값은 deterministic해야 한다. 테스트 케이스가 명시적으로 필요로 하지 않는 한 random value를 사용하지 않는다.
- Domain aggregate fixture와 HTTP request payload fixture는 분리한다.
- Fixture builder는 Nest app, repository, persistence client, container 또는 다른 external I/O에 의존하면 MUST NOT 된다.
- Adapter setup helper는 context fixture directory가 아니라 `apps/api/test/support/` 아래에 둔다.

## Persistence 통합 테스트

- 데이터베이스가 필요한 persistence 통합 테스트는 테스트 러너가 관리하는 로컬 컨테이너를 MUST 사용한다.
- Postgres 기반 persistence 통합 테스트는 `apps/api/test/{context}/infrastructure/persistence/` 아래에 MUST 두고, spec file name에 `.postgres`를 포함한다.
- 일반적인 persistence 통합 테스트 실행에서 개발자가 데이터베이스를 미리 만들거나 `DATABASE_URL`을 설정하도록 요구하지 않는다.
- 데이터베이스 컨테이너 이미지는 `latest` 같은 floating tag 대신 version을 고정한다.
- Repository 테스트가 실행되기 전에 중앙화된 test support code에서 필요한 데이터베이스 schema를 생성한다.
- Production migration file이 생기기 전까지는 spec에서 adapter table DDL을 중복하지 말고 disposable test database에 `drizzle-kit push --force`를 사용한다.
- Production migration file이 도입되면 persistence 통합 테스트는 schema push 대신 test container에 migration을 적용하는 방식을 SHOULD 사용한다.
- 테스트 케이스 사이에 persisted state를 정리한다. `afterEach`에서 adapter가 소유한 table을 truncate하는 방식을 선호한다.
- 하나의 database container를 공유하는 persistence 통합 테스트는 각 spec이 isolated database 또는 schema를 사용하지 않는 한 file-level parallelism을 피해야 한다.
- `pnpm api:test:integration:postgres`와 `pnpm api:test:integration:all`을 실행하려면 Docker 또는 호환 container runtime이 필요하다.

## 명령어

```bash
pnpm api:lint:check       # 현재 ESLint 검사
pnpm api:test:unit        # 단위 테스트
pnpm api:test             # 단위 테스트, 그 다음 통합 테스트
pnpm api:test:integration # Postgres가 필요 없는 통합 테스트
pnpm api:test:integration:postgres # Postgres 기반 통합 테스트
pnpm api:test:integration:all # 모든 통합 테스트
pnpm api:test:watch       # 단위 테스트 watch 모드
pnpm api:test:cov         # 단위 테스트 커버리지
```

PR을 열기 전에 변경 범위에 맞는 검사를 실행한다. 고립된 서비스나 함수만 변경했다면 `pnpm api:lint:check`와 `pnpm api:test:unit`을 실행한다. config wiring, route, module configuration, application bootstrap flow가 변경되었다면 `pnpm api:test:integration`도 실행한다. Postgres persistence wiring 또는 repository behavior가 변경되었다면 `pnpm api:test:integration:postgres`를 실행한다.
