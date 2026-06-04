---
title: API 컨벤션 인덱스
lang: ko
audience: both
applies_to:
  - apps/api
source: ../en/index.md
last_synced: 2026-06-04
related:
  - ./architecture.md
  - ./source-dependency.md
  - ./runtime-wiring.md
  - ./test.md
---

# API 컨벤션 인덱스

## Source Of Truth

영어 API convention 문서가 source of truth다.
한국어 문서는 human-facing translation이다.

## Reading Rules

현재 작업과 관련 있는 API convention 문서만 읽는다.
공개 project Markdown 문서를 변경할 때는 repository documentation convention index도 함께 읽는다.

## Routing

- API architecture, DDD boundary, source structure 작업: [API 아키텍처 컨벤션](./architecture.md)을 읽는다.
- Import direction, layer boundary, framework import, source dependency check 작업: [Source Dependency 컨벤션](./source-dependency.md)을 읽는다.
- NestJS DI, provider registration, module wiring, bootstrap flow, port binding 작업: [Runtime Wiring 컨벤션](./runtime-wiring.md)을 읽는다.
- API test file, test structure, test command 선택 작업: [테스트 컨벤션](./test.md)을 읽는다.
