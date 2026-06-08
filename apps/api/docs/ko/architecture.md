---
title: API 아키텍처 컨벤션
lang: ko
audience: both
applies_to:
  - apps/api
source: ../en/architecture.md
last_synced: 2026-06-08
related:
  - ./error.md
  - ./ddd.md
  - ./source-dependency.md
  - ./runtime-wiring.md
---

# API 아키텍처 컨벤션

이 문서는 API architecture map이다.
세부 규칙은 연결된 문서를 사용한다.

API architecture는 두 축으로 설명한다.

- DDD 모델 경계는 모델, 언어, 책임이 유효한 범위를 정의한다.
- 의존성 및 레이어 경계는 어떤 코드가 어떤 코드에 의존할 수 있는지 정의한다.

model ownership, domain language, shared domain concept가 바뀌는 경우 DDD 규칙을 읽는다.
import, layer placement, provider wiring, framework boundary가 바뀌는 경우 source dependency 및 runtime wiring 규칙을 읽는다.
error, exception, 또는 system error를 정의, 변환, masking, 노출하는 경우 error policy를 읽는다.

## 관련 문서

- [API 오류 정책](./error.md): error meaning, category, transformation, structure, unexpected system error handling 규칙.
- [DDD 컨벤션](./ddd.md): bounded context, implementation module, shared kernel, domain model 규칙.
- [Source Dependency 컨벤션](./source-dependency.md): import direction, layer boundary, framework import 규칙.
- [Runtime Wiring 컨벤션](./runtime-wiring.md): NestJS DI, provider registration, bootstrap, port binding 규칙.

## 목표 구조

API source의 목표 map은 다음과 같다.

```text
src/
  main.ts
  core/
  layer-kernels/
    domain/
    application/
    infrastructure/
    presentation/
  shared-kernel/
  bootstrap/
    nest/
      app.module.ts
      start-nest-app.ts
      config/
      filters/
      interceptors/
      guards/
      pipes/
  contexts/
    {context-name}/
      domain/
      application/
      infrastructure/
      presentation/
```

이 map은 의도적으로 high-level로 둔다.
각 context 내부의 subdirectory는 feature, adapter type, framework need에 따라 달라질 수 있다.

## 디렉터리 읽기 규칙

- 디렉터리 트리를 단순한 기술적 folder layout으로만 읽지 않는다.
- 먼저 DDD 모델 경계를 식별한다: bounded context 또는 shared kernel.
- 그다음 dependency boundary를 식별한다: core, layer-kernel, context layer, shared-kernel, bootstrap.
- 상세 placement, import, wiring 규칙은 관련 convention document를 사용한다.
