# API ESLint 규칙

## 활성화된 규칙

- `unused-imports/no-unused-imports`: ESLint autofix 시 사용하지 않는 import 선언을 제거한다.
- `api-local/import-path-style`: production `src` import가 source boundary를 넘을 때 설정된 tsconfig path alias를 사용하도록 강제한다.

## 로컬 규칙 구현

Local rule implementation은 `apps/api/eslint/rules/` 아래에 둔다.
