# 아키텍처 컨벤션

아키텍처 규칙은 dependency가 한 방향으로 흐르게 하고 layer boundary를 명시적으로 만든다. Domain behavior는 persistence, transport, framework, presentation concern으로부터 독립적이어야 한다.

## Layer Boundary

- Domain code는 business rule과 domain language를 소유한다.
- Application code는 use case를 orchestrate하고 domain outcome을 application outcome으로 변환한다.
- Infrastructure code는 database, SDK, network, 기타 technical dependency와 통신한다.
- Presentation code는 application result와 error를 protocol-safe response로 변환한다.
- Shared `libs`는 application module이나 bootstrap code에 의존하면 안 된다.

Domain file은 Nest, HTTP exception, application service, infrastructure adapter, presentation DTO, mapper implementation을 import하지 않는다.
Application file은 infrastructure 또는 presentation adapter에 의존하지 않는다.
Infrastructure file은 presentation file에 의존하지 않는다.

## Domain Model

Domain model은 domain에 필요한 behavior와 state를 노출해야 한다. Persistence 또는 API serialization method를 노출하면 안 된다.

- `create`, `restore`, `of`, `createMany` 같은 factory로 validation을 거쳐 domain model을 만든다.
- Constructor는 기본적으로 private으로 둔다.
- Persistence/API 변환 관심사는 domain model 밖에 둔다.

## Mapper

Mapper는 layer boundary를 명시적으로 유지한다. 한 layer의 model을 다른 layer의 model로 변환하며, persistence, transport, framework serialization concern을 domain model에 넣지 않는다.

공유 mapper interface는 `@libs/layer`에서 사용한다.

| Interface | Boundary |
| --- | --- |
| `PersistenceMapper` | Infrastructure persistence record <-> domain model |
| `ApplicationErrorMapper` | Domain error -> application error |
| `PresentationMapper` | Application 또는 domain-safe output -> response DTO |
| `PresentationErrorMapper` | Application error -> HTTP-safe response body와 status code |

Application mapper는 domain result 또는 error를 application result 또는 error로 변환할 수 있다. `CreateCorrectionErrorMapper`처럼 담당 use case나 workflow를 드러내는 이름을 사용하고, Nest 또는 HTTP type을 import하지 않는다.

Mapper logic은 shape translation과 error meaning translation에 머물러야 한다. Business decision을 mapper에 두지 않는다.

## 정적 검사

API harness는 이 컨벤션의 기계적인 부분을 강제한다.
ESLint로 강제되는 architecture와 mapper 검사는 [API ESLint rules README](../../eslint/README.kr.md#domain-rules)와 [mapper rules section](../../eslint/README.kr.md#mapper-rules)에 정리한다.

- Dependency Cruiser는 layer dependency direction을 강제한다.
- ESLint는 domain construction과 mapper boundary pattern을 강제한다.

## 테스트

Architecture-sensitive behavior는 가장 작은 유용한 수준에서 테스트해야 한다.
Mapper test는 exact input/output shape를 검증하는 pure unit test여야 하며, 안전한 `details` field가 보존되는지와 presentation error mapper의 HTTP status mapping을 함께 확인한다.
