---
title: API 아키텍처 컨벤션
lang: ko
audience: both
applies_to:
  - apps/api
source: ../en/architecture.md
last_synced: 2026-06-04
related:
  - ./ddd.md
  - ./source-dependency.md
  - ./runtime-wiring.md
---

# API 아키텍처 컨벤션

API 아키텍처 규칙은 두 축으로 나누어 본다.

- DDD 모델 경계는 모델, 언어, 책임이 유효한 범위를 정의한다.
- 의존성 및 레이어 경계는 어떤 코드가 어떤 코드에 의존할 수 있는지 정의한다.

새 bounded context를 추가하거나, domain code를 이동하거나, shared code를 도입하기 전에 두 축을 모두 읽어야 한다.

## 관련 문서

- [DDD 컨벤션](./ddd.md): bounded context, implementation module, shared kernel, domain model 규칙.
- [Source Dependency 컨벤션](./source-dependency.md): import direction, layer boundary, framework import 규칙.
- [Runtime Wiring 컨벤션](./runtime-wiring.md): NestJS DI, provider registration, bootstrap, port binding 규칙.

## 목표 구조

API source의 목표 구조는 다음과 같다.

```text
src/
  foundation/
  layer-kernels/
    domain/
    application/
    infrastructure/
    presentation/
  shared-kernel/
  composition-root/
    nest/
      app.module.ts
      main.ts
      config/
      filters/
      interceptors/
      guards/
      pipes/
  bounded-contexts/
    corrections/
      domain/
      application/
        commands/
        queries/
      infrastructure/
        persistence/
          postgres-drizzle/
        messaging/
        external/
      presentation/
        http/
          controllers/
          dto/
          mappers/
    users/
      domain/
      application/
      infrastructure/
      presentation/
```

현재 코드는 아직 `src/modules/*`, `src/libs/ddd`, `src/libs/layer/*`, `src/libs/result`, `src/database` 같은 전환기 디렉터리를 사용할 수 있다.
source tree가 rename되기 전까지는 이 디렉터리를 이 컨벤션의 아키텍처 개념에 대한 호환 이름으로 본다.

## 디렉터리 읽기 규칙

- 디렉터리 트리를 단순한 기술적 folder layout으로만 읽지 않는다.
- 먼저 DDD 모델 경계를 식별한다: bounded context 또는 shared kernel.
- 그다음 dependency boundary를 식별한다: foundation, layer-kernel, bounded-context layer, shared-kernel, composition-root.
- `bounded-contexts/{context}` directory는 목표 구조에서 DDD model boundary를 나타낸다.
- NestJS module과 다른 implementation module은 bounded context 내부의 code wiring unit이다. 기본적으로 별도 DDD model boundary가 아니다.
- `composition-root`는 business layer가 아니다. 앱을 bootstrap하고 runtime module을 wiring하는 역할만 한다.

## 공통 디렉터리 규칙

- `common` 또는 `shared`를 큰 catch-all directory로 사용하지 않는다.
- layer-free primitive는 `foundation`에 둔다.
- layer-specific shared policy는 `layer-kernels/` 아래에 둔다.
- domain-layer 공통 policy는 `layer-kernels/domain`에 둔다.
- application-layer 공통 contract는 `layer-kernels/application`에 둔다.
- infrastructure-layer 공통 adapter policy는 `layer-kernels/infrastructure`에 둔다.
- presentation-layer 공통 policy는 `layer-kernels/presentation`에 둔다.
- feature-specific rule은 소유 bounded context 내부에 둔다.
- 여러 bounded context가 작은 domain model을 의도적으로 공유하는 경우가 아니라면 `shared-kernel`은 `.gitkeep`만 두고 비워 둔다.
