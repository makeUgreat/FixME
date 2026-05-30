# Test Convention

The API app uses Vitest and separates unit tests from integration tests. Prefer unit tests first based on execution speed and verification scope. Write integration tests when the test must verify multiple real components working together, such as framework configuration, module wiring, Nest application bootstrap, routing, or actual HTTP responses.

## Common Review Rules

- Use a subdirectory close to the target being tested. Example: `apps/api/test/metrics/metrics.service.spec.ts`
- Use the target name in `describe()`.
- Each `it()` should call one unit of work and verify one specific endpoint of behavior.
- Keep status code, body, and header assertions in the same `it()` when they verify the same execution result.
- Split `it()` blocks when the execution path or expected result differs, such as success, failure, exception, boundary value, authorization, or validation.
- Verify async behavior clearly with `async/await` or Vitest `resolves`/`rejects` matchers.
- Do not share state between tests. If a shared resource is required, create it in `beforeEach` and clean it up in `afterEach`.
- Tests must produce the same result under the same conditions.

## Unit Tests

- Run unit tests with `pnpm api:test:unit`.
- Prefer placing unit tests next to the target file. Tests that need shared harnesses, fixtures, or cross-cutting setup may live under `apps/api/test/{domain}/`.
- Target pure services, functions, and small units of business logic.
- Do not use an HTTP server, actual Nest application bootstrap, or external I/O.
- Create required dependencies directly or replace them with lightweight mocks/stubs.
- Use a Nest testing module only when DI configuration must be verified.
- A unit of work is the flow from an entry point call to an observable endpoint of behavior.
- The entry point is usually a public method or function call.
- The endpoint of behavior is one of: return value, thrown exception, state change, or dependency call.
- The outer `describe()` should be the unit under test. Example: `describe('MetricsService')`
- The inner `describe()` should be the method or main public API. Example: `describe('getMetrics')`
- Each `it()` should cover one condition and one endpoint of behavior for that method.
- Return values, exceptions, state changes, and dependency calls are different endpoint types, so test them in separate `it()` blocks.
- A dependency means anything that cannot be fully controlled during a unit test, such as the file system, network, database, external team code, or slow computation.
- Replace dependencies with stubs when needed, but keep tests that verify dependency calls to a minimum.

## Integration Tests

- Run integration tests with `pnpm api:test:integration`.
- Use integration tests to verify interactions that unit tests cannot cover, such as config-to-rule wiring, dependency injection wiring, framework bootstrap, routing, and controller responses.
- If a test uses hard-to-control elements such as an actual network, REST API, system time, file system, or database, separate it as an integration test instead of a unit test.
- For Nest app integration tests, use `app.inject()` as the standard Fastify request approach.
- Nest app integration test files should create the app in `beforeEach` and close it with `app.close()` in `afterEach`.
- The outer `describe()` should name the integrated target.
- For route tests, the inner `describe()` should be the controller method and route. Example: `describe('GET /metrics')`
- Each `it()` should cover one request condition or integration condition and one expected result.
- Split `it()` blocks when the HTTP result differs, such as successful response, bad request, authentication/authorization failure, not found, or server error.
- Verify HTTP status code, response body, and important headers together.

## Commands

```bash
pnpm api:lint:check       # Static convention checks
pnpm api:test:unit        # Unit tests
pnpm api:test             # All Vitest tests
pnpm api:test:integration # Integration tests
pnpm api:test:watch       # Unit test watch mode
pnpm api:test:cov         # Unit test coverage
```

Before opening a PR, run the checks that match the scope of the change. If only isolated services or functions changed, run `pnpm api:lint:check` and `pnpm api:test:unit`. If config wiring, routes, module configuration, or application bootstrap flow changed, also run `pnpm api:test:integration`.
