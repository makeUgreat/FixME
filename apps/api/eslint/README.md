# API ESLint Rules

This directory contains the API app's local ESLint configuration and custom
rules. Convention documents explain intent; this README is the concise catalog
of deterministic ESLint checks enforced by `pnpm api:lint:check` and
`pnpm api:harness:local`.

## Configured Rule Sets

| Source                                       | Scope                       | Purpose                                                                   |
| -------------------------------------------- | --------------------------- | ------------------------------------------------------------------------- |
| `@eslint/js` recommended                     | All linted files            | Applies ESLint's base JavaScript correctness rules.                       |
| `typescript-eslint` recommended type-checked | All linted TypeScript files | Applies TypeScript-aware recommended rules with project type information. |
| `eslint-plugin-prettier/recommended`         | All linted files            | Reports Prettier formatting differences through ESLint.                   |
| Local `style` plugin                         | All linted files            | Reports project-specific TypeScript style suggestions.                    |

## Shared Rules

| Rule                                      | Level | Scope            | Check                                                                            |
| ----------------------------------------- | ----- | ---------------- | -------------------------------------------------------------------------------- |
| `@typescript-eslint/no-explicit-any`      | off   | All linted files | Explicit `any` is allowed where the codebase needs it.                           |
| `@typescript-eslint/no-empty-object-type` | error | All linted files | Empty object types are disallowed except interfaces with a single `extends`.     |
| `@typescript-eslint/no-floating-promises` | warn  | All linted files | Floating promises are reported as warnings.                                      |
| `@typescript-eslint/no-unsafe-argument`   | warn  | All linted files | Unsafe arguments are reported as warnings.                                       |
| `@typescript-eslint/no-unused-vars`       | off   | All linted files | Disabled in favor of `unused-imports/no-unused-vars`.                            |
| `neverthrow/must-use-result`              | error | Production code  | Production code must consume returned `Result` values.                           |
| `unused-imports/no-unused-imports`        | error | All linted files | Unused imports are not allowed.                                                  |
| `unused-imports/no-unused-vars`           | error | All linted files | Unused variables are not allowed after normal TypeScript exclusions are applied. |
| `no-restricted-syntax`                    | error | All linted files | TypeScript `enum` is not allowed; use `as const` constants plus union types.     |

## Style Rules

| Rule                            | Level | Scope            | Check                                                                                                                         |
| ------------------------------- | ----- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `style/prefer-inline-satisfies` | warn  | All linted files | A typed `const` object literal used only as the direct argument of the next `return` call should be inlined with `satisfies`. |

## Naming Rules

See the [naming convention](../docs/en/naming-convention.md) for naming intent.

| Rule                                    | Level | Scope                                      | Check                                                                                                                       |
| --------------------------------------- | ----- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `naming/type-name-matches-file-name`    | error | `src/**/*.ts` except ignored support files | Files with recognized role suffixes must declare the matching type name, such as `user-profile.entity.ts` -> `UserProfile`. |
| `check-file/filename-naming-convention` | error | `src/**/*.ts`                              | Source filenames must use lowercase kebab-style segments.                                                                   |
| `@typescript-eslint/naming-convention`  | error | All linted files                           | Variables, parameters, members, and type-like declarations must follow the configured casing rules.                         |

## Domain Rules

See the [architecture convention](../docs/en/architecture-convention.md) and
[error convention](../docs/en/error-convention.md) for domain and error intent.

| Rule                                      | Level | Scope                                                           | Check                                                                                                                                                      |
| ----------------------------------------- | ----- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `domain/factory-result-return`            | error | `src/**/*.ts`                                                   | Public domain model factories must explicitly return `Result`.                                                                                             |
| `domain/no-direct-new`                    | error | `src/**/*.ts`                                                   | Domain models must be created through factories rather than `new` outside their own class body.                                                            |
| `domain/domain-error-shape`               | error | `src/**/*.ts` except shared `error.base.ts`                     | Domain `err({ ... })` objects must include `kind`, `code`, `message`, and `details`, and use supported domain error categories.                            |
| `domain/no-global-domain-error-codes`     | error | `src/libs/ddd/error.base.ts`                                    | Shared `DomainError` must not become a registry of feature-domain error codes; shared DDD-owned `entity.*` codes are allowed.                              |
| `domain/prefer-domain-error-of`           | error | `src/**/*.ts` except shared `error.base.ts`                     | Domain error contracts must use `DomainErrorOf<Kind, Owner, Reason, Details>` instead of spelling out the shape.                                  |
| `domain/split-multiple-validation-errors` | error | `src/**/*.ts`                                                   | Domain model `validateProps` entrypoints should split multiple direct validation failures into named validation methods.                                    |
| `domain/require-unit-spec`                | error | `src/**/*.aggregate.ts`, `src/**/*.entity.ts`, `src/**/*.vo.ts` | Domain model files must have unit specs under a colocated `__tests__` directory.                                                                           |
| `no-restricted-imports`                   | error | `src/modules/*/domain/**/*.ts`                                  | Domain files must not import Nest or HTTP exceptions.                                                                                                      |
| `no-restricted-syntax`                    | error | `src/**/*.aggregate.ts`, `src/**/*.entity.ts`                   | Aggregate and entity constructors must be private or protected; public static factories must be named `create` or `restore`.                               |
| `no-restricted-syntax`                    | error | `src/**/*.vo.ts`                                                | Value object constructors must be private or protected; public static factories must be named `of` or `createMany`.                                        |

## Mapper Rules

See the [architecture convention](../docs/en/architecture-convention.md) for
mapper boundary principles.

| Rule                                   | Level | Scope         | Check                                                                                                                              |
| -------------------------------------- | ----- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `mapper/implements-layer-mapper`       | error | `src/**/*.ts` | Infrastructure, application error, HTTP presentation error, and generic presentation mapper classes must use their layer-specific mapper contract. |
| `mapper/no-domain-model-serialization` | error | `src/**/*.ts` | Domain models must not define boundary serialization methods such as `toResponse`, `toRecord`, `toDto`, `toJSON`, or `fromRecord`. |
| `mapper/no-error-contract-in-mapper`   | error | `src/**/*.ts` | Mapper files must not export error contract types; application error contracts belong in `.error.ts` files.                        |
| `mapper/no-nest-in-application-error`  | error | `src/**/*.ts` | Application error contract files must not import Nest or HTTP types.                                                               |
| `mapper/no-nest-in-application-mapper` | error | `src/**/*.ts` | Application mappers must not import Nest or HTTP types.                                                                            |
| `mapper/prefer-application-error-of`   | error | `src/**/*.ts` | Application error contracts must use `ApplicationErrorOf<Kind, Owner, Reason, Details>` instead of spelling out the shape.         |

## Test Rules

See the [test convention](../docs/en/test-convention.md) for testing intent.

| Rule                                        | Level | Scope                              | Check                                                                                                   |
| ------------------------------------------- | ----- | ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `neverthrow/must-use-result`                | off   | `src/**/*.spec.ts`, `test/**/*.ts` | Tests may inspect `Result` values without the production consumption rule.                              |
| `test/korean-test-case-name`                | error | `src/**/*.spec.ts`, `test/**/*.ts` | Test case names must be written in Korean.                                                              |
| `test/integration-adapter-target-file-name` | error | `src/**/*.spec.ts`, `test/**/*.ts` | Integration spec file names must identify an adapter target or configured system target.                 |
| `test/integration-file-location`            | error | `src/**/*.spec.ts`, `test/**/*.ts` | Integration specs must live under `apps/api/test`.                                                      |
| `test/integration-describe-name`            | error | `src/**/*.spec.ts`, `test/**/*.ts` | Integration spec top-level `describe` names must identify the integrated target.                        |
| `test/no-direct-integration-bootstrap`      | error | `src/**/*.spec.ts`, `test/**/*.ts` | Integration tests must use the shared Nest test app helper instead of bootstrapping directly.           |
| `test/no-misleading-integration-file-name`  | error | `src/**/*.spec.ts`, `test/**/*.ts` | Files named `*.integration-spec.ts` must be integration tests, and unit tests must not use that suffix. |
