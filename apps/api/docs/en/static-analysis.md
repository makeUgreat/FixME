---
title: Static Analysis Convention for apps/api
lang: en
audience: both
applies_to:
  - apps/api
translation: ../ko/static-analysis.md
related:
  - ./source-dependency.md
  - ./test.md
---

# Static Analysis Convention for apps/api

Static analysis checks make `apps/api` conventions reviewable.
Use this document to decide where a check belongs, which files it should inspect, and how exceptions are handled.

## Tool Responsibilities

- TypeScript verifies type safety and module resolution.
- Prettier owns formatting only.
- ESLint owns local source rules that can be judged from one file or nearby AST context.
- dependency-cruiser owns import graph rules, layer boundaries, circular dependencies, and forbidden dependencies between files.
- Do not duplicate the same rule across tools unless one tool gives a materially clearer failure message or catches a different risk.
- Convention documents explain the intent of a rule. Tool configuration enforces the mechanical check.

## Configuration Location

- The ESLint configuration for `apps/api` lives under `apps/api/eslint/`.
- `apps/api/eslint.config.mjs` is the app entry point for ESLint.
- If app-local ESLint rule implementations are needed, place them under `apps/api/eslint/rules/`.
- Repository-wide dependency-cruiser defaults live in `.dependency-cruiser.cjs`.
- dependency-cruiser rules specific to `apps/api` live in `apps/api/.dependency-cruiser.cjs`.
- Keep root configuration limited to defaults that can apply to more than one app.

## File Scope

- The default static analysis scope for `apps/api` is `apps/api/src` and `apps/api/test`.
- Exclude generated output, coverage output, and installed dependencies from static analysis.
- Current standard exclusions are `dist`, `coverage`, and `node_modules`.
- Production source and test source may use different rule overrides, but both remain in the default checked scope.
- Do not silently narrow the checked file scope to make a rule pass. Narrow scope only when the convention itself has a smaller valid boundary.

## Rule Scope

- Format rules belong to Prettier.
- Type and module-resolution rules belong to TypeScript.
- File naming, unused imports, local code style, app-local naming, and single-file test conventions belong to ESLint.
- Import direction, cross-layer dependency, circular dependency, dependency reachability, and forbidden framework import rules belong to dependency-cruiser.
- Detailed layer and import direction policy belongs in [Source Dependency Convention](./source-dependency.md).
- Test structure and command selection policy belongs in [Test Convention](./test.md).

## Rule Clarity

- Static analysis rules should be understandable to the developer who hit the failure.
- Rule names should describe the architectural or maintainability boundary they enforce.
- Failure messages should explain what was violated, why the boundary exists, and the preferred fix direction.
- Convention documentation for a rule should include its intent, invalid example, valid example, and exception policy when the rule is not self-evident.
- Prefer intent-based rule groups, such as layer boundaries or module boundaries, over many narrow rules that expose only incidental implementation details.
- Distinguish auto-fixable mechanical rules from rules that require design judgment.
- Rules that require design judgment need clearer messages and documentation than rules that can be auto-fixed.
- Exception guidance should make local deviations easy to review and remove.
- When practical, failure messages or rule documentation should link to the convention document that explains the rule.
- A rule should guide developers toward the intended design, not only toward the smallest change that makes the check pass.

## Test Scope

- Test-specific static analysis exceptions are allowed when tests verify wiring, adapters, fixtures, or integration behavior.
- Shared test support may depend on multiple layers only when it is explicitly test-only and does not leak into production source.
- Production source MUST NOT import from `apps/api/test` or test support directories.
- Prefer targeted overrides for test exceptions instead of excluding all tests from a rule.

## Exceptions

- Every inline disable comment or allow rule must include the reason for the exception.
- Repeated exceptions should be moved into a named override, allowlist, or convention update.
- Temporary migration gaps should stay in work notes, PR descriptions, or targeted TODOs instead of becoming permanent convention text.
- Do not add broad exceptions such as whole-directory ignores unless the directory is generated, external, or outside the convention's intended scope.

## Adding Rules

- Add a rule only when it enforces a stable convention, correctness risk, review standard, or maintainability boundary.
- Before adding a convention-enforcing rule, document the rule intent in the relevant convention document.
- Add mechanical enforcement after the documentation states the policy.
- If a new rule would break existing code widely, introduce it with a narrow file scope, a documented baseline, or a staged migration.
- Rule changes should keep `pnpm api:lint:check` and `pnpm api:deps:check` meaningful as local review commands.
