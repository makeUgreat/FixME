---
title: API Convention Index
lang: en
audience: both
applies_to:
  - apps/api
translation: ../ko/index.md
related:
  - ./error.md
  - ./architecture.md
  - ./source-dependency.md
  - ./static-analysis.md
  - ./runtime-wiring.md
  - ./test.md
---

# API Convention Index

## Source Of Truth

English `apps/api` convention documents are the source of truth.
Korean documents are human-facing translations.

## Reading Rules

Read only the `apps/api` convention documents relevant to the current task.
When changing public project Markdown documents, also read the repository documentation convention index.

## Routing

- API error definitions, mapping, masking, propagation, or failure contract reviews: read [API Error Policy](./error.md).
- `apps/api` architecture, DDD boundaries, or source structure: read [API Architecture Convention](./architecture.md).
- Import direction, layer boundaries, framework imports, or source dependency checks: read [Source Dependency Convention](./source-dependency.md).
- Static analysis config, lint rule ownership, dependency-cruiser rule scope, file scope, or error policy: read [Static Analysis Convention for apps/api](./static-analysis.md).
- NestJS DI, provider registration, module wiring, bootstrap flow, or port binding: read [Runtime Wiring Convention](./runtime-wiring.md).
- `apps/api` test files, test structure, or test command selection: read [Test Convention](./test.md).
