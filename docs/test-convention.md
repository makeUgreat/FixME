# Test Convention

This project uses Vitest and separates unit tests from E2E tests. Prefer unit tests first based on execution speed and verification scope. Write E2E tests only when the test must verify Nest application bootstrap, routing, module wiring, and actual HTTP responses.

## Common Rules

- Place test files under `test/`.
- Use a subdirectory close to the target being tested. Example: `test/metrics/metrics.service.spec.ts`
- Use the target name in `describe()`.
- Write `it()` test case names in Korean, and make each sentence clearly describe the condition and expected result.
- Each `it()` should call one unit of work and verify one specific endpoint of behavior.
- Keep status code, body, and header assertions in the same `it()` when they verify the same execution result.
- Split `it()` blocks when the execution path or expected result differs, such as success, failure, exception, boundary value, authorization, or validation.
- Verify async behavior clearly with `async/await` or Vitest `resolves`/`rejects` matchers.
- Do not share state between tests. If a shared resource is required, create it in `beforeEach` and clean it up in `afterEach`.
- Tests must produce the same result under the same conditions.

## Unit Tests

- Use the `*.spec.ts` file name pattern.
- Run unit tests with `pnpm test`.
- Target pure services, functions, and small units of business logic.
- Do not use an HTTP server, actual Nest application bootstrap, or external I/O.
- Create required dependencies directly or replace them with lightweight mocks/stubs.
- Use a Nest testing module only when DI configuration must be verified.
- A unit of work is the flow from an entry point call to an observable endpoint of behavior.
- The entry point is usually a public method or function call.
- The endpoint of behavior is one of: return value, thrown exception, state change, or dependency call.
- The outer `describe()` should be the unit under test. Example: `describe('MetricsService')`
- The inner `describe()` should be the method or main public API. Example: `describe('getMetrics')`
- Each `it()` should cover one condition and one endpoint of behavior for that method. The test case name must be written in Korean. Example: `it('metrics가 수집되면 Prometheus metrics를 반환한다')`
- Return values, exceptions, state changes, and dependency calls are different endpoint types, so test them in separate `it()` blocks.
- A dependency means anything that cannot be fully controlled during a unit test, such as the file system, network, database, external team code, or slow computation.
- Replace dependencies with stubs when needed, but keep tests that verify dependency calls to a minimum.

Structure checklist:

- [ ] Does the file name match `*.spec.ts`?
- [ ] Is the outer `describe()` the target name?
- [ ] Is the inner `describe()` the method or main public API name?
- [ ] Is each `it()` name written in Korean?
- [ ] Does each `it()` verify only one unit of work and one endpoint of behavior: return value, exception, state change, or dependency call?
- [ ] Are hard-to-control dependencies such as the file system, network, database, and real time avoided directly or replaced with stubs when needed?

## E2E Tests

- Use the `*.e2e-spec.ts` file name pattern.
- Run E2E tests with `pnpm test:e2e`.
- Start the full Nest application and verify routing, module wiring, and controller responses.
- If a test uses hard-to-control elements such as an actual network, REST API, system time, file system, or database, separate it as an E2E or integration test instead of a unit test.
- Use E2E tests to verify system interactions that unit tests cannot cover.
- Because this project uses Fastify, use `createE2eApp()` and `app.inject()` as the standard approach.
- Each test file should create the app in `beforeEach` and close it with `app.close()` in `afterEach`.
- The outer `describe()` should be the controller. Example: `describe('MetricsController (e2e)')`
- The inner `describe()` should be the controller method and route. Example: `describe('GET /metrics')`
- Each `it()` should cover one request condition and one expected response for that route. The test case name must be written in Korean. Example: `it('정상 요청이면 Prometheus metrics를 반환한다')`
- Split `it()` blocks when the HTTP result differs, such as successful response, bad request, authentication/authorization failure, not found, or server error.
- Verify HTTP status code, response body, and important headers together.

Structure checklist:

- [ ] Does the file name match `*.e2e-spec.ts`?
- [ ] Is the outer `describe()` the controller name?
- [ ] Does the inner `describe()` include both HTTP method and route, such as `GET /metrics`?
- [ ] Is each `it()` name written in Korean?
- [ ] Does each `it()` verify only one request condition and expected response, with separate tests for different HTTP results?
- [ ] Are status code, body, and header assertions for the same response kept in one `it()`?
- [ ] Does each test create the app with `createE2eApp()`, send requests with `app.inject()`, and close the app after each test?

## Commands

```bash
pnpm test        # Unit tests
pnpm test:e2e    # E2E tests
pnpm test:watch  # Unit test watch mode
pnpm test:cov    # Unit test coverage
```

Before opening a PR, run the tests that match the scope of the change. If only services or functions changed, run `pnpm test`. If routes, module configuration, or application bootstrap flow changed, also run `pnpm test:e2e`.
