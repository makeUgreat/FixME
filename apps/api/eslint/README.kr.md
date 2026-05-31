# API ESLint Rules

이 디렉터리는 API app의 로컬 ESLint 설정과 custom rule을 담는다.
컨벤션 문서는 의도를 설명하고, 이 README는 `pnpm api:lint:check`와
`pnpm api:harness:local`에서 강제되는 deterministic ESLint check를 간결하게
정리한다.

## Configured Rule Sets

| Source | Scope | Purpose |
| --- | --- | --- |
| `@eslint/js` recommended | 모든 lint 대상 file | ESLint의 기본 JavaScript correctness rule을 적용한다. |
| `typescript-eslint` recommended type-checked | 모든 lint 대상 TypeScript file | TypeScript project type 정보를 사용하는 recommended rule을 적용한다. |
| `eslint-plugin-prettier/recommended` | 모든 lint 대상 file | Prettier formatting 차이를 ESLint issue로 보고한다. |

## Shared Rules

| Rule | Level | Scope | Check |
| --- | --- | --- | --- |
| `@typescript-eslint/no-explicit-any` | off | 모든 lint 대상 file | 필요한 경우 explicit `any`를 허용한다. |
| `@typescript-eslint/no-empty-object-type` | error | 모든 lint 대상 file | 단일 `extends` interface를 제외한 empty object type을 허용하지 않는다. |
| `@typescript-eslint/no-floating-promises` | warn | 모든 lint 대상 file | Floating promise를 warning으로 보고한다. |
| `@typescript-eslint/no-unsafe-argument` | warn | 모든 lint 대상 file | Unsafe argument를 warning으로 보고한다. |
| `@typescript-eslint/no-unused-vars` | off | 모든 lint 대상 file | `unused-imports/no-unused-vars`를 사용하기 위해 끈다. |
| `neverthrow/must-use-result` | error | Production code | Production code는 반환된 `Result` value를 반드시 소비해야 한다. |
| `unused-imports/no-unused-imports` | error | 모든 lint 대상 file | 사용하지 않는 import를 허용하지 않는다. |
| `unused-imports/no-unused-vars` | error | 모든 lint 대상 file | TypeScript의 일반 제외 규칙을 적용한 뒤에도 남는 unused variable을 허용하지 않는다. |
| `no-restricted-syntax` | error | 모든 lint 대상 file | TypeScript `enum`을 허용하지 않는다. `as const` constant와 union type을 사용한다. |

## Naming Rules

네이밍 의도는 [네이밍 컨벤션](../docs/kr/naming-convention.md)을 참고한다.

| Rule | Level | Scope | Check |
| --- | --- | --- | --- |
| `naming/type-name-matches-file-name` | error | 일부 support file을 제외한 `src/**/*.ts` | 인식 가능한 role suffix가 있는 source file은 파일명에 맞는 type name을 선언해야 한다. 예: `user-profile.entity.ts` -> `UserProfile`. |
| `check-file/filename-naming-convention` | error | `src/**/*.ts` | Source filename은 lowercase kebab-style segment를 사용해야 한다. |
| `@typescript-eslint/naming-convention` | error | 모든 lint 대상 file | Variable, parameter, member, type-like declaration은 설정된 casing rule을 따라야 한다. |

## Domain Rules

Domain과 error 의도는 [아키텍처 컨벤션](../docs/kr/architecture-convention.md)과
[에러 컨벤션](../docs/kr/error-convention.md)을 참고한다.

| Rule | Level | Scope | Check |
| --- | --- | --- | --- |
| `domain/factory-result-return` | error | `src/**/*.ts` | Public domain model factory는 명시적으로 `Result`를 반환해야 한다. |
| `domain/no-direct-new` | error | `src/**/*.ts` | Domain model은 자기 class body 밖에서 `new`로 직접 생성하지 않고 factory를 통해 생성해야 한다. |
| `domain/domain-error-shape` | error | Shared `error.type.ts`를 제외한 `src/**/*.ts` | Domain `err({ ... })` object는 `kind`, `code`, `message`, `details`를 포함하고 지원되는 domain error category를 사용해야 한다. |
| `domain/no-global-domain-error-codes` | error | `src/libs/ddd/error.type.ts` | Shared `DomainError`가 feature-domain error code registry가 되는 것을 막는다. |
| `domain/split-multiple-validation-errors` | error | `src/**/*.ts` | `validateProps`에서 여러 validation failure를 직접 반환하지 않고 named validation method로 분리해야 한다. |
| `domain/require-unit-spec` | error | `src/**/*.aggregate.ts`, `src/**/*.entity.ts`, `src/**/*.vo.ts` | Domain model file은 colocated unit spec을 가져야 한다. |
| `no-restricted-imports` | error | `src/modules/*/domain/**/*.ts` | Domain file은 Nest 또는 HTTP exception을 import하면 안 된다. |
| `no-restricted-syntax` | error | `src/**/*.aggregate.ts`, `src/**/*.entity.ts` | Aggregate와 entity constructor는 private/protected여야 하며, public static factory 이름은 `create` 또는 `restore`여야 한다. |
| `no-restricted-syntax` | error | `src/**/*.vo.ts` | Value object constructor는 private/protected여야 하며, public static factory 이름은 `of` 또는 `createMany`여야 한다. |

## Mapper Rules

Mapper boundary 원칙은 [아키텍처 컨벤션](../docs/kr/architecture-convention.md)을
참고한다.

| Rule | Level | Scope | Check |
| --- | --- | --- | --- |
| `mapper/implements-layer-mapper` | error | `src/**/*.ts` | Infrastructure, application error, presentation mapper class는 layer-specific mapper interface를 구현해야 한다. |
| `mapper/no-domain-model-serialization` | error | `src/**/*.ts` | Domain model은 `toResponse`, `toRecord`, `toDto`, `toJSON`, `fromRecord` 같은 boundary serialization method를 정의하면 안 된다. |
| `mapper/no-error-contract-in-mapper` | error | `src/**/*.ts` | Mapper file은 error contract type을 export하면 안 되며, application error contract는 `.error.ts` file에 둔다. |
| `mapper/no-nest-in-application-error` | error | `src/**/*.ts` | Application error contract file은 Nest 또는 HTTP type을 import하면 안 된다. |
| `mapper/no-nest-in-application-mapper` | error | `src/**/*.ts` | Application mapper는 Nest 또는 HTTP type을 import하면 안 된다. |

## Test Rules

테스트 의도는 [테스트 컨벤션](../docs/kr/test-convention.md)을 참고한다.

| Rule | Level | Scope | Check |
| --- | --- | --- | --- |
| `neverthrow/must-use-result` | off | `src/**/*.spec.ts`, `test/**/*.ts` | Test에서는 production Result consumption rule을 끄고 직접 값을 검사할 수 있다. |
| `test/korean-test-case-name` | error | `src/**/*.spec.ts`, `test/**/*.ts` | Test case name은 한국어로 작성해야 한다. |
| `test/integration-file-location` | error | `src/**/*.spec.ts`, `test/**/*.ts` | Integration spec은 `apps/api/test` 아래에 있어야 한다. |
| `test/integration-describe-name` | error | `src/**/*.spec.ts`, `test/**/*.ts` | Integration spec의 top-level `describe`는 integrated target을 식별해야 한다. |
| `test/no-direct-integration-bootstrap` | error | `src/**/*.spec.ts`, `test/**/*.ts` | Integration test는 직접 bootstrap하지 않고 shared Nest test app helper를 사용해야 한다. |
| `test/no-misleading-integration-file-name` | error | `src/**/*.spec.ts`, `test/**/*.ts` | `*.integration-spec.ts` file은 integration test여야 하며, unit test는 이 suffix를 사용하면 안 된다. |
