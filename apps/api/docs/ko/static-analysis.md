---
title: apps/api 정적검사 컨벤션
lang: ko
audience: both
applies_to:
  - apps/api
source: ../en/static-analysis.md
last_synced: 2026-06-04
related:
  - ./source-dependency.md
  - ./test.md
---

# apps/api 정적검사 컨벤션

Static analysis check는 `apps/api` convention을 review 가능한 규칙으로 만든다.
이 문서는 check가 어느 도구에 속하는지, 어떤 file을 검사해야 하는지, 예외를 어떻게 다루는지 결정할 때 사용한다.

## Tool Responsibilities

- TypeScript는 type safety와 module resolution을 검증한다.
- Prettier는 formatting만 담당한다.
- ESLint는 하나의 file 또는 가까운 AST context에서 판단할 수 있는 local source rule을 담당한다.
- dependency-cruiser는 import graph rule, layer boundary, circular dependency, file 간 forbidden dependency를 담당한다.
- 한 도구가 더 명확한 failure message를 제공하거나 다른 risk를 잡는 경우가 아니라면 같은 rule을 여러 도구에 중복하지 않는다.
- Convention 문서는 rule의 의도를 설명한다. Tool configuration은 기계적인 check를 강제한다.

## Configuration Location

- `apps/api`의 ESLint configuration은 `apps/api/eslint/` 아래에 둔다.
- `apps/api/eslint.config.mjs`는 ESLint의 app entry point다.
- App-local ESLint rule implementation이 필요하면 `apps/api/eslint/rules/` 아래에 둔다.
- Repository-wide dependency-cruiser default는 `.dependency-cruiser.cjs`에 둔다.
- `apps/api`에만 적용되는 dependency-cruiser rule은 `apps/api/.dependency-cruiser.cjs`에 둔다.
- Root configuration은 둘 이상의 app에 적용할 수 있는 default로 제한한다.

## File Scope

- `apps/api`의 기본 static analysis scope는 `apps/api/src`와 `apps/api/test`다.
- Generated output, coverage output, installed dependency는 static analysis에서 제외한다.
- 현재 표준 제외 대상은 `dist`, `coverage`, `node_modules`다.
- Production source와 test source는 서로 다른 rule override를 사용할 수 있지만, 둘 다 기본 checked scope에 포함한다.
- Rule을 통과시키기 위해 checked file scope를 조용히 좁히면 안 된다. Convention 자체가 더 작은 valid boundary를 가질 때만 scope를 좁힌다.

## Rule Scope

- Format rule은 Prettier에 속한다.
- Type과 module-resolution rule은 TypeScript에 속한다.
- File naming, unused import, local code style, app-local naming, single-file test convention은 ESLint에 속한다.
- Import direction, cross-layer dependency, circular dependency, dependency reachability, forbidden framework import rule은 dependency-cruiser에 속한다.
- 자세한 layer와 import direction policy는 [Source Dependency 컨벤션](./source-dependency.md)에 둔다.
- Test structure와 command selection policy는 [테스트 컨벤션](./test.md)에 둔다.

## Rule Clarity

- Static analysis rule은 failure를 만난 개발자가 이해할 수 있어야 한다.
- Rule name은 그 rule이 강제하는 architectural boundary 또는 maintainability boundary를 설명해야 한다.
- Failure message는 무엇을 위반했는지, 그 boundary가 왜 존재하는지, 어떤 방향으로 수정해야 하는지 설명해야 한다.
- Rule이 자명하지 않다면 convention documentation에 intent, invalid example, valid example, exception policy를 포함해야 한다.
- 우발적인 implementation detail만 드러내는 좁은 rule을 많이 두기보다 layer boundary나 module boundary 같은 intent-based rule group을 선호한다.
- Auto-fix 가능한 mechanical rule과 design judgment가 필요한 rule을 구분한다.
- Design judgment가 필요한 rule은 auto-fix 가능한 rule보다 더 명확한 message와 documentation이 필요하다.
- Exception guidance는 local deviation을 review하고 제거하기 쉽게 만들어야 한다.
- 가능하면 failure message 또는 rule documentation은 rule을 설명하는 convention document로 연결해야 한다.
- Rule은 check를 통과시키는 최소 변경만 유도하지 말고, intended design으로 개발자를 안내해야 한다.

## Test Scope

- Test-specific static analysis exception은 test가 wiring, adapter, fixture, integration behavior를 검증할 때 허용된다.
- Shared test support는 명시적으로 test-only이고 production source로 새지 않을 때만 여러 layer에 의존할 수 있다.
- Production source는 `apps/api/test` 또는 test support directory에서 import하면 안 된다.
- Rule에서 모든 test를 제외하기보다 targeted override로 test exception을 두는 것을 선호한다.

## Exceptions

- 모든 inline disable comment 또는 allow rule은 예외 이유를 포함해야 한다.
- 반복되는 예외는 named override, allowlist, convention update로 옮기는 것이 좋다.
- Temporary migration gap은 permanent convention text로 만들지 말고 work note, PR description, targeted TODO에 둔다.
- Directory가 generated, external, 또는 convention의 intended scope 밖에 있는 경우가 아니라면 whole-directory ignore 같은 broad exception을 추가하지 않는다.

## Adding Rules

- 안정적인 convention, correctness risk, review standard, maintainability boundary를 강제할 때만 rule을 추가한다.
- Convention-enforcing rule을 추가하기 전에 관련 convention 문서에 rule intent를 문서화한다.
- Documentation이 policy를 명시한 뒤 mechanical enforcement를 추가한다.
- 새 rule이 기존 code를 넓게 깨뜨린다면 좁은 file scope, documented baseline, staged migration으로 도입한다.
- Rule change는 `pnpm api:lint:check`와 `pnpm api:deps:check`를 local review command로 의미 있게 유지해야 한다.
