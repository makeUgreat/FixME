# 테스트 컨벤션

API 앱은 Vitest를 사용하며 단위 테스트와 통합 테스트를 분리한다. 실행 속도와 검증 범위를 기준으로 단위 테스트를 먼저 선호한다. 프레임워크 설정, 모듈 연결, Nest 애플리케이션 부트스트랩, 라우팅, 실제 HTTP 응답처럼 여러 실제 컴포넌트가 함께 동작하는지 검증해야 할 때 통합 테스트를 작성한다.

## 공통 리뷰 규칙

- 테스트 대상과 가까운 하위 디렉터리를 사용한다. 예: `apps/api/test/metrics/metrics.service.spec.ts`
- `describe()`에는 테스트 대상 이름을 사용한다.
- 각 `it()`는 하나의 작업 단위를 호출하고 하나의 구체적인 동작 결과를 검증해야 한다.
- 상태 코드, 본문, 헤더가 같은 실행 결과를 검증한다면 같은 `it()` 안에서 assertion한다.
- 성공, 실패, 예외, 경계값, 인증/인가, validation처럼 실행 경로나 기대 결과가 다르면 `it()` 블록을 나눈다.
- 비동기 동작은 `async/await` 또는 Vitest `resolves`/`rejects` matcher로 명확히 검증한다.
- 테스트 사이에 상태를 공유하지 않는다. 공유 리소스가 필요하면 `beforeEach`에서 만들고 `afterEach`에서 정리한다.
- 테스트는 같은 조건에서 항상 같은 결과를 내야 한다.

## 단위 테스트

- 단위 테스트는 `pnpm api:test:unit`으로 실행한다.
- 단위 테스트는 테스트 대상 파일 옆에 두는 것을 선호한다. 공유 harness, fixture, cross-cutting setup이 필요한 테스트는 `apps/api/test/{domain}/` 아래에 둘 수 있다.
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

- 통합 테스트는 `pnpm api:test:integration`으로 실행한다.
- config-to-rule wiring, dependency injection wiring, framework bootstrap, routing, controller response처럼 단위 테스트로 다룰 수 없는 상호작용을 검증할 때 통합 테스트를 사용한다.
- 실제 네트워크, REST API, 시스템 시간, 파일 시스템, 데이터베이스처럼 통제하기 어려운 요소를 사용하는 테스트는 단위 테스트가 아니라 통합 테스트로 분리한다.
- Nest 앱 통합 테스트는 표준 Fastify 요청 방식으로 `app.inject()`를 사용한다.
- Nest 앱 통합 테스트 파일은 `beforeEach`에서 app을 만들고 `afterEach`에서 `app.close()`로 닫아야 한다.
- 바깥 `describe()`는 통합 대상 이름을 지정해야 한다.
- 라우트 테스트에서는 안쪽 `describe()`가 controller method와 route를 나타내야 한다. 예: `describe('GET /metrics')`
- 각 `it()`는 하나의 요청 조건 또는 통합 조건과 하나의 기대 결과를 다뤄야 한다.
- 성공 응답, bad request, authentication/authorization failure, not found, server error처럼 HTTP 결과가 다르면 `it()` 블록을 나눈다.
- HTTP 상태 코드, 응답 본문, 중요한 헤더를 함께 검증한다.

## 명령어

```bash
pnpm api:lint:check       # 정적 컨벤션 검사
pnpm api:test:unit        # 단위 테스트
pnpm api:test             # 모든 Vitest 테스트
pnpm api:test:integration # 통합 테스트
pnpm api:test:watch       # 단위 테스트 watch 모드
pnpm api:test:cov         # 단위 테스트 커버리지
```

PR을 열기 전에 변경 범위에 맞는 검사를 실행한다. 고립된 서비스나 함수만 변경했다면 `pnpm api:lint:check`와 `pnpm api:test:unit`을 실행한다. config wiring, route, module configuration, application bootstrap flow가 변경되었다면 `pnpm api:test:integration`도 실행한다.
