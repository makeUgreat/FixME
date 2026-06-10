---
title: API Source Dependency 컨벤션
lang: ko
audience: both
applies_to:
  - apps/api
source: ../en/source-dependency.md
last_synced: 2026-06-10
related:
  - ./architecture.md
  - ./runtime-wiring.md
---

# API Source Dependency 컨벤션

Source dependency rule은 source file이 무엇을 import할 수 있는지 판단한다.
의존성 방향은 outer layer에서 inner layer로 일관되게 유지해야 한다.

## 시각적 의존성 지도

모든 화살표는 "source가 target을 import할 수 있다"는 뜻으로 읽는다.
여기에 표시되지 않았고 이 문서에서 명시적으로 허용하지 않은 의존성은 기본적으로 금지된 것으로 본다.

```mermaid
flowchart TB
  subgraph adapters[Outer Adapters]
    direction LR
    presentation[Presentation]
    infrastructure[Infrastructure]
  end

  application[Application]
  domain[Domain]
  core[Core]

  subgraph kernels[Layer Kernels]
    direction TB
    presentationKernel[Presentation Kernel]
    infrastructureKernel[Infrastructure Kernel]
    applicationKernel[Application Kernel]
    domainKernel[Domain Kernel]
  end

  presentation --> application
  infrastructure --> application
  application --> domain
  domain --> core

  presentation --> presentationKernel
  infrastructure --> infrastructureKernel
  application --> applicationKernel
  domain --> domainKernel
  presentationKernel --> core
  infrastructureKernel --> core
  applicationKernel --> core
  domainKernel --> core
```

주요 source direction은 다음과 같다.

```text
presentation -> application -> domain -> core
infrastructure -> application -> domain -> core
```

## 금지되는 Shortcut

```text
domain -/-> application
domain -/-> infrastructure
domain -/-> presentation
domain -/-> bootstrap
application core -/-> infrastructure implementations
application core -/-> presentation DTOs
application core -/-> framework decorators
application core -/-> framework DI APIs
application core -/-> bootstrap concrete types
```

## Source Direction

- `core`는 어떤 project layer에도 의존하지 않는다.
- Layer-kernel directory는 `core`에 의존할 수 있다.
- `domain`은 `core`와 `layer-kernels/domain`에 의존할 수 있다.
- `application`은 `core`, `domain`, `layer-kernels/application`에 의존할 수 있다.
- `infrastructure`는 adapter 구현 시 `core`, `domain`, `application`, `layer-kernels/infrastructure`, external library에 의존할 수 있다.
- `presentation`은 external protocol 처리 시 `core`, `application`, `layer-kernels/presentation`, framework library에 의존할 수 있다.
- `contexts/{context-name}/{context-name}.module.ts` 같은 bounded context root module은 feature를 조립하기 위해 해당 context의 application, presentation, infrastructure code에 의존할 수 있다.
- 얇은 `src/main.ts` entrypoint를 제외한 `bootstrap` 외부의 production code는 `bootstrap`를 import하면 안 된다. [`api-not-to-bootstrap-from-production`](../../dependency-cruiser/rules/runtime-wiring.cjs)이 강제한다.
- Domain code는 `bootstrap`, NestJS, database, HTTP, SDK, infrastructure, presentation, application code를 import하면 안 된다. [`api-domain-stays-inner`](../../dependency-cruiser/rules/source-dependency.cjs)와 [`api-inner-layers-not-to-frameworks`](../../dependency-cruiser/rules/runtime-wiring.cjs)가 강제한다.
- Application core는 infrastructure implementation, presentation DTO, framework decorator, framework DI API, bootstrap concrete type을 import하면 안 된다. [`api-application-stays-inner`](../../dependency-cruiser/rules/source-dependency.cjs)와 [`api-inner-layers-not-to-frameworks`](../../dependency-cruiser/rules/runtime-wiring.cjs)가 강제한다.

## Core

- `core`는 layer, framework, bounded context, business vocabulary가 없는 pure primitive를 담는다.
- 예: `Result`, `Option`, `BaseError`, `assertNever`, generic guard.
- 모든 layer는 `core`에 의존할 수 있다.
- `core`는 project layer, framework, external SDK, business concept에 의존하면 안 된다. [`api-core-is-independent`](../../dependency-cruiser/rules/source-dependency.cjs)와 [`api-inner-layers-not-to-frameworks`](../../dependency-cruiser/rules/runtime-wiring.cjs)가 강제한다.

## Domain Layer

- domain layer는 business rule과 domain model을 담는다.
- entity, value object, aggregate, domain service, domain event, domain error에 사용한다.
- Domain code는 application, infrastructure, presentation, framework, database, HTTP, SDK detail을 알면 안 된다.
- Domain code는 pure business behavior와 invariant를 표현하는 것이 좋다.
- Domain code는 `core`와 `layer-kernels/domain`에 의존할 수 있다.

## Application Layer

- application layer는 use case와 application flow를 표현한다.
- command, query, use case handler, application service, application-owned port interface, transaction boundary, application error에 사용한다.
- Application core는 use case flow와 contract를 뜻하며 NestJS module 또는 provider registration을 뜻하지 않는다.
- Application code는 domain model을 사용해 user intent를 실행한다.
- Application code는 infrastructure implementation detail을 알면 안 된다.
- Application code는 presentation request 또는 response DTO shape를 알면 안 된다.
- Application core는 framework decorator 또는 framework DI API에 의존하면 안 된다.
- Application use case wiring용 NestJS module file은 `contexts/{context-name}/application` 아래가 아니라 bounded context root에 둔다.
- Application code는 domain error와 port error를 application 또는 use case error으로 변환할 수 있다.
- Application core는 `core`, domain code, `layer-kernels/application`에 의존할 수 있다.

## Infrastructure Layer

- infrastructure layer는 technical adapter를 구현한다.
- database, ORM, external API, file system, message broker, SDK, persistence code에 사용한다.
- Infrastructure code는 application-owned port 또는 domain/application contract를 구현한다.
- Adapter code는 Prisma, TypeORM, HTTP client, SDK, Drizzle error 같은 technology-specific error를 port 또는 infrastructure error으로 변환한다.
- Infrastructure code는 framework와 external library에 의존할 수 있다.
- Infrastructure code는 presentation code를 알 필요가 없다. [`api-infrastructure-not-to-presentation-or-bootstrap`](../../dependency-cruiser/rules/source-dependency.cjs)이 강제한다.

## Presentation Layer

- presentation layer는 external request와 response의 entry point다.
- controller, resolver, request DTO, response DTO, protocol mapper, HTTP error mapper에 사용한다.
- Presentation code는 application use case를 호출한다. [`api-presentation-not-to-domain-infrastructure-or-bootstrap`](../../dependency-cruiser/rules/source-dependency.cjs)이 강제한다.
- Presentation code는 application error을 protocol response로 변환하고 masking policy를 적용한다.
- Presentation code는 domain 또는 infrastructure error을 client에 직접 노출하지 않는 것이 좋다.
- Presentation code는 framework와 protocol library에 의존할 수 있다.

## Kernel Directories

- `layer-kernels/domain`은 domain-layer 공통 policy만 담는다.
- `layer-kernels/application`은 application-layer 공통 contract만 담는다.
- `layer-kernels/infrastructure`는 infrastructure 공통 adapter policy만 담는다.
- `layer-kernels/presentation`은 presentation-layer 공통 policy만 담는다.
- Layer-kernel directory는 `core`에 의존할 수 있다.
- Layer-kernel directory는 bounded context, bootstrap code, framework code, outer layer에 의존하면 안 된다. [`api-layer-kernels-stay-in-layer`](../../dependency-cruiser/rules/source-dependency.cjs)와 [`api-inner-layers-not-to-frameworks`](../../dependency-cruiser/rules/runtime-wiring.cjs)가 강제한다.
- Kernel directory는 generic utility bucket이 되면 안 된다.
- Feature-specific policy는 소유 bounded context 내부에 둔다.
