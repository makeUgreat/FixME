---
title: API Test Convention
lang: en
audience: both
applies_to:
  - apps/api
translation: ../ko/test.md
related:
  - ./index.md
---

# Test Convention

The API app uses Vitest and separates unit tests from integration tests. Prefer unit tests first based on execution speed and verification scope. Write integration tests when the test must verify multiple real components working together, such as framework configuration, module wiring, Nest application bootstrap, routing, or actual HTTP responses.

No test convention ESLint checks are currently enabled.

## Common Review Rules

- Use the standard directory for the test type. Unit tests live under `__tests__` in the target file's directory. Integration tests live under the matching architecture path in `apps/api/test/{context}/`.
- Use the target name in `describe()`.
- Each `it()` should call one unit of work and verify one specific behavior result.
- Keep status code, body, and header assertions in the same `it()` when they verify the same execution result.
- Split `it()` blocks when the execution path or expected result differs, such as success, failure, exception, boundary value, authentication/authorization, or validation.
- Verify async behavior clearly with `async/await` or Vitest `resolves`/`rejects` matchers.
- Do not share state between tests. If a shared resource is required, create it in `beforeEach` and clean it up in `afterEach`.
- Tests must produce the same result under the same conditions.
- Test shared contracts from base classes, abstract classes, and shared helpers in the test file for that shared target. Concrete class tests should focus on the concrete class's own rules, validation, composition, and error cases.
- If a concrete class overrides shared behavior or combines it in a way that changes the observable result, test that concrete behavior in the concrete class test.

## Unit Tests

- Run unit tests with `pnpm api:test:unit`.
- Place unit tests in a `__tests__` directory inside the target file's directory. Example: `apps/api/src/contexts/corrections/domain/__tests__/mistake.vo.spec.ts`
- Target pure services, functions, and small units of business logic.
- Do not use an HTTP server, actual Nest application bootstrap, or external I/O.
- Create required dependencies directly or replace them with lightweight mocks/stubs.
- Use a Nest testing module only when DI configuration must be verified.
- A unit of work is the flow from an entry point call to an observable behavior result.
- The entry point is usually a public method or function call.
- The behavior result is one of: return value, thrown exception, state change, or dependency call.
- The outer `describe()` should be the unit under test. Example: `describe('MetricsService')`
- The inner `describe()` should be the method or main public API. Example: `describe('getMetrics')`
- Each `it()` should cover one condition and one behavior result for that method.
- Return values, exceptions, state changes, and dependency calls are different result types, so test them in separate `it()` blocks.
- A dependency means anything that cannot be fully controlled during a unit test, such as the file system, network, database, external team code, or slow computation.
- Replace dependencies with stubs when needed, but keep tests that verify dependency calls to a minimum.

## Integration Tests

- Run integration tests that do not require Postgres with `pnpm api:test:integration`.
- Run Postgres-backed integration tests with `pnpm api:test:integration:postgres`.
- Run all integration tests with `pnpm api:test:integration:all`.
- Use integration tests to verify interactions that unit tests cannot cover, such as config-to-rule wiring, dependency injection wiring, framework bootstrap, routing, and controller responses.
- If a test uses hard-to-control elements such as an actual network, REST API, system time, file system, or database, separate it as an integration test instead of a unit test.
- Treat integration tests as adapter contract tests for boundaries that face external protocols or persistence.
- Split integration spec files by context and architecture layer. For example, use `test/corrections/presentation/corrections-http.controller.integration-spec.ts` for an HTTP controller adapter, `test/corrections/infrastructure/persistence/correction.repository.memory.integration-spec.ts` for the memory repository adapter, and `test/corrections/infrastructure/persistence/correction.repository.postgres-drizzle.integration-spec.ts` for the Postgres Drizzle repository adapter.
- Do not create extra adapter directories below `infrastructure/persistence`. Put the persistence adapter name in the spec file name.
- Do not use integration tests to repeat every domain or application invariant. Keep detailed domain and application rule coverage in unit tests, and use integration tests for observable boundary behavior such as request and response shape, validation pipe behavior, dependency injection wiring, framework routing, and repository save/find contracts.
- For Nest app integration tests, use `app.inject()` as the standard Fastify request approach.
- Nest app integration test files should create the app in `beforeEach` and close it with `app.close()` in `afterEach`.
- The outer `describe()` should name the integrated target.
- For route tests, the inner `describe()` should be the controller method and route. Example: `describe('GET /metrics')`
- Each `it()` should cover one request condition or integration condition and one expected result.
- Split `it()` blocks when the HTTP result differs, such as successful response, bad request, authentication/authorization failure, not found, or server error.
- Verify HTTP status code, response body, and important headers together.

## Integration Test Fixtures

- Start with fixture builders inside the spec file when only one spec uses them.
- Move repeated context-level fixtures to `apps/api/test/{context}/fixtures/` when two or more integration specs need the same valid aggregate, value object, command, or request payload.
- Name fixture builders by the object they create. Example: `createCorrectionFixture`.
- Fixture builders SHOULD return valid objects by default and expose explicit overrides for fields relevant to a test.
- Keep fixture defaults deterministic. Do not use random values unless the test case explicitly needs them.
- Keep domain aggregate fixtures separate from HTTP request payload fixtures.
- Fixture builders MUST NOT depend on Nest apps, repositories, persistence clients, containers, or other external I/O.
- Keep adapter setup helpers under `apps/api/test/support/`, not under context fixture directories.

## Persistence Integration Tests

- Persistence integration tests that require a database MUST use a local container managed by the test runner.
- Postgres-backed persistence integration tests MUST live under `apps/api/test/{context}/infrastructure/persistence/` and include `.postgres` in the spec file name.
- Do not require developers to pre-create a database or set `DATABASE_URL` for normal persistence integration test runs.
- Pin database container image versions instead of using floating tags such as `latest`.
- Create required database schema in centralized test support code before repository tests run.
- Until production migration files exist, use `drizzle-kit push --force` against the disposable test database instead of duplicating adapter table DDL in specs.
- When production migration files are introduced, persistence integration tests SHOULD apply those migrations to the test container instead of using schema push.
- Clean persisted state between test cases. Prefer truncating the adapter-owned tables in `afterEach`.
- Persistence integration tests that share one database container MUST avoid file-level parallelism unless each spec uses isolated databases or schemas.
- Docker or a compatible container runtime is required for `pnpm api:test:integration:postgres` and `pnpm api:test:integration:all`.

## Commands

```bash
pnpm api:lint:check       # Current ESLint checks
pnpm api:test:unit        # Unit tests
pnpm api:test             # Unit tests, then integration tests
pnpm api:test:integration # Integration tests that do not require Postgres
pnpm api:test:integration:postgres # Postgres-backed integration tests
pnpm api:test:integration:all # All integration tests
pnpm api:test:watch       # Unit test watch mode
pnpm api:test:cov         # Unit test coverage
```

Before opening a PR, run the checks that match the scope of the change. If only isolated services or functions changed, run `pnpm api:lint:check` and `pnpm api:test:unit`. If config wiring, routes, module configuration, or application bootstrap flow changed, also run `pnpm api:test:integration`. If Postgres persistence wiring or repository behavior changed, run `pnpm api:test:integration:postgres`.
