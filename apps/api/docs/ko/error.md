---
title: API 오류 정책
lang: ko
audience: both
applies_to:
  - apps/api
source: ../en/error.md
last_synced: 2026-06-08
read_when:
  - API error와 system error를 정의, mapping, masking, propagation, review할 때.
related:
  - ./architecture.md
  - ./source-dependency.md
---

# API 오류 정책

Error는 API의 control flow와 contract의 일부다.
이 문서는 failure의 의미, 소유 layer, 변환 시점, 노출 가능한 정보를 판단할 때 사용한다.

## Error와 Exception의 의미

이 프로젝트는 application-controlled error와 application이 합리적으로 제어할 수 없는 failure를 구분한다.
이 구분은 IEEE Std 610.12-1990에 대한 프로젝트 해석을 따른다.

- Application-controlled error는 정상적인 program execution 중 발생할 수 있고 application code 또는 owning boundary가 처리, 변환, 복구, 노출할 수 있는 failure value다.
- Exception은 NestJS `HttpException` 또는 JavaScript `Error`처럼 throw되거나 framework-level에서 다루는 failure object다.
- System error는 application이 normal code path로 합리적으로 제어하거나 복구할 수 없는 심각한 failure다.
- Vendor raw error는 application이 변환하기 전에 external adapter, SDK, database, HTTP client, framework가 정의한 failure value다.
- Error는 log가 아니다.
- Logging은 failure observability를 도울 수 있지만, logging만으로 failure handling이 되지는 않는다.

Application-controlled failure contract는 `DomainError`, `ApplicationError`, `InfrastructureError`, `PresentationHttpError`처럼 error naming을 사용해야 한다.
Exception naming은 throw되는 object와 project가 이름을 소유하지 않는 external framework type에 남겨둔다.

## Error 분류

Error는 먼저 그 의미를 소유한 boundary 기준으로 분류한다.

- Domain error는 business rule failure와 domain invariant violation을 설명한다.
- Application error는 use case failure, orchestration failure, application-owned contract failure를 설명한다.
- Infrastructure error는 technical adapter failure가 application-controlled shape으로 변환된 뒤의 실패를 설명한다.
- Presentation error는 HTTP response, GraphQL error, request validation failure 같은 protocol-facing failure response를 설명한다.

각 layer는 responsibility, bounded context, aggregate, service, adapter, use case 기준으로 error를 더 구체화할 수 있다.
이 구체화는 보통 base data structure보다 error value와 code를 더 많이 바꾼다.

Failure는 application-controlled contract 바깥에서 올 수도 있다.

- Vendor raw error는 external adapter, SDK, database, HTTP client, framework에서 온 raw failure다.
- System error는 normal application contract로 처리할 수 없는 예상하지 못한 runtime, process, network, OS, resource, environment failure다.

## Error 변환

Error는 owner, audience, contract가 바뀌는 boundary를 건널 때 변환하는 것이 좋다.

- Adapter boundary가 failure를 이해할 수 있을 때 vendor raw error를 infrastructure, port, 또는 application-controlled error로 변환한다.
- Use case가 caller-facing meaning을 소유할 때 domain error를 application 또는 use case error로 변환한다.
- Protocol boundary에서는 application error를 presentation error 또는 throw되는 protocol exception으로 변환한다.
- 독립적인 bounded context 또는 module을 건너는 error는 그 boundary가 사용하는 communication contract를 통해 변환한다.
- Presentation boundary는 external client에 error, exception, system error를 노출하기 전에 반드시 masking을 적용해야 한다.

Call stack이 내부 folder boundary를 건넜다는 이유만으로 기계적 wrapping을 추가하지 않는다.
Contract stability, information hiding, ownership, caller behavior를 개선하는 controllable boundary에서 변환하는 것을 선호한다.

핵심 규칙은 application 내부에서 처리하는 failure는 application-controlled error shape을 가지는 것이 좋고, application 바깥으로 보내는 failure는 안정적인 external contract를 반드시 사용해야 한다는 것이다.

## Error 구조

정답인 error shape은 하나가 아니다.
Application-controlled error를 정의할 때는 owning contract가 다르게 정할 이유가 없다면 다음 구조를 선호한다.

- `code`는 사람과 기계가 error를 분류하는 데 사용하는 안정적이고 식별 가능한 값이다.
- `message`는 debugging, operation, presentation을 위한 사람이 읽을 수 있는 context다.
- `details`는 caller behavior 또는 machine processing을 위한 structured data다.

`code`는 owning contract 안에서 안정적인 것이 좋다.
내부 구현 detail, framework, vendor, database, 일시적인 technology choice를 노출하는 이름을 피하는 것이 좋다.
Caller는 `message`를 parsing하지 말고 `code`에 의존하는 것이 좋다.

`message`는 error를 처리하는 사람에게 유용해야 한다.
`message`는 변경, localization, masking, 이후 boundary의 rewrite가 가능하다.
Code는 정확한 `message` text에 의존하면 안 된다.

`details`는 receiving side가 의존해도 되는 structured data만 담는 것이 좋다.
`details`는 contract의 일부가 되므로 작고 안정적으로 유지한다.
Validation error는 caller가 조치할 수 있을 때 field-level details를 포함할 수 있다.

Public caller behavior와 internal diagnosis가 모두 structured data를 필요로 한다면 public contract data와 internal diagnostic data를 분리한다.
Protocol contract가 명시적으로 허용하지 않는 한 internal diagnostic data를 presentation error로 노출하지 않는다.

## 예상하지 못한 System Error

Application이 가능한 모든 thrown value나 failure를 알고 처리할 수는 없다.
Boundary에서는 whitelist approach를 사용한다.

- Boundary가 명시적으로 이해하는 exception만 처리하고 보존한다.
- 인식하지 못한 failure는 해당 boundary의 external contract를 위한 common unexpected 또는 internal error로 변환한다.
- 가능하면 original cause를 보존한다.
- 인식하지 못한 failure는 logging, metrics, tracing 또는 다른 operational signal을 통해 observable하게 만든다.
- 정상적으로 예상된 error는 owning boundary의 observability policy가 요구하지 않는 한 log로 남길 필요가 없다.
- Unknown failure를 처리하거나 observable하게 만들지 않고 삼켜 silent failure를 만들지 않는다.

Application 바깥으로 보내는 unexpected system error response는 반드시 masking되어야 한다.
External response는 안정적이고 안전해야 하며, original cause는 internal observability를 통해 확인할 수 있어야 한다.
