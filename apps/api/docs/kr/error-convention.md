# 에러 컨벤션

에러는 실패를 명시적으로 만들고, 그 실패를 이해하는 레이어에 가깝게 두며, boundary에서 쉽게 변환할 수 있어야 한다. 목표는 모든 exception을 없애는 것이 아니다. 목표는 예상 가능한 비즈니스 실패가 숨겨진 control flow가 되지 않게 하는 것이다.

## 핵심 원칙

- 예상 가능하고 복구 가능한 실패는 value로 표현한다.
- Exception은 programming error, framework misuse, 현재 레이어에서 의미 있게 처리할 수 없는 failure에만 남겨둔다.
- 실패 이름은 그것을 만든 기술이 아니라 현재 레이어에서의 의미로 짓는다.
- 레이어 boundary를 넘을 때 error를 변환하고 lower-layer detail을 위로 누출하지 않는다.
- Exhaustive branching과 안정적인 client-facing code를 지원하는 error shape를 선호한다.

## Result

호출자가 success와 failure를 모두 처리해야 한다면 `Result`를 사용한다. 이렇게 하면 failure path가 function contract의 일부가 된다.

Domain decision, use case outcome, 기타 예측 가능한 branch에는 `Result`를 사용한다. "이 비즈니스 작업이 예상 가능한 방식으로 실패했다"는 의미를 nullable value, boolean flag, magic string, thrown exception으로 표현하지 않는다.

모든 function이 `Result`를 반환하도록 강제하지 않는다. 의미 있는 failure path가 없는 순수 계산은 plain value를 반환할 수 있다. Programmer mistake를 알리는 function은 여전히 throw할 수 있다.

`Result`를 소비할 때는 명시적으로 branch한다. 읽는 사람이 success path와 failure path가 어디서 갈라지는지 볼 수 있어야 한다.

## Domain Error

Domain error는 domain rule이 operation을 거부한 이유를 설명한다. Domain language로 표현하고 해당 rule을 소유한 aggregate, entity, value object, domain service 가까이에 둔다.

호출자가 category별로 branch할 수 있으면서도 정확한 reason을 안정적인 code로 유지할 수 있도록 discriminated union을 사용한다.

넓은 처리에는 `kind`를 사용한다.

| Kind | 의미 |
| --- | --- |
| `invariant_violation` | 입력 또는 상태가 항상 유지되어야 하는 rule을 깨뜨린다. |
| `state_conflict` | 요청한 operation이 현재 domain state와 충돌한다. |
| `operation_not_allowed` | rule은 유효하지만 actor 또는 context가 operation을 수행할 수 없다. |

정확한 domain reason에는 `code`를 사용한다. Code는 test, log, API response, client behavior에 사용할 만큼 안정적이어야 한다. `{domain}.{reason}` 형식을 선호한다.

모든 domain code를 하나의 global union에 넣지 않는다. Shared error kind는 application에 공통 handling vocabulary를 제공하지만, domain-specific code는 그 code를 정의한 domain이 소유해야 한다.

## Application Error

Application error는 orchestration의 실패를 설명한다: authentication, authorization, workflow policy, 변환 후 dependency availability, domain 또는 external system 사이의 coordination.

실패가 domain rule이 아니라면 domain error를 재사용하지 않는다. Use case는 호출한 domain의 domain error를 반환할 수 있지만, use case 자체가 만든 failure는 application error여야 한다.

Application code는 lower-layer failure가 사용자에게 의미 있는지, retry 가능한지, forbidden인지, unavailable인지, unexpected인지 결정해야 한다. 그 결정은 충분한 context를 가진 레이어에 속한다.

## Infrastructure Error

Infrastructure error는 보통 technology-shaped다: database constraint error, network timeout, SDK exception, serialization error 등이 해당한다.

Technology-shaped error가 domain 또는 application contract로 새어 나가게 하지 않는다. Infrastructure boundary 가까이에서 catch하거나 contain한 뒤, caller가 유용한 결정을 할 수 있을 때 application-level meaning으로 변환한다.

Dependency API가 exception 기반이라면 infrastructure code 내부에서 exception을 사용하는 것은 괜찮다. 이 컨벤션은 boundary를 무엇이 통과하는지에 관한 것이지, external library가 pure하다고 가장하자는 것이 아니다.

## API Error

API error는 presentation concern이다. 안정적이고 client-safe한 정보를 노출하고 내부 구현 detail은 숨겨야 한다.

Domain 또는 application code에 HTTP exception을 import하지 않는다. Domain/application error는 controller, presenter, exception-filter boundary에서 HTTP status code로 mapping한다.

안정적인 error code를 노출한다. Message는 안전하고 의도적인 경우에만 user-facing text로 취급한다. Internal diagnostic은 log에 둔다.

HTTP status mapping은 error가 발생한 source file이 아니라 error의 의미를 따라야 한다. 예를 들어 domain state conflict는 보통 invariant violation과 다르게 mapping된다.

## 테스트

예상 가능한 failure는 반환된 value로 테스트한다. Failure가 contract의 일부라면 broad category와 precise code를 모두 검증한다.

Exception assertion은 programming mistake, invalid framework usage, 명시적으로 unrecoverable failure처럼 의도적으로 exceptional한 동작에만 사용한다.

Failure test는 business condition을 test name에 설명해야 한다. Message가 의도적인 public contract가 아니라면 incidental infrastructure message에 의존하지 않는다.
