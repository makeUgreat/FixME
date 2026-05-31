# 네이밍 컨벤션

간결하고 역할이 드러나는 이름을 사용한다. `Impl`, `Adapter`, `Port`, `Aggregate`, `Entity`, `Vo` 같은 메타 이름은 해당 단어가 도메인 언어의 일부가 아니라면 type name에 사용하지 않는다.

## 도메인 모델

- aggregate, entity, value object에는 단수 도메인 용어를 사용한다: `Post`, `PostTitle`, `UserEmail`.
- 내부 상태에는 `Props`, 생성 입력에는 `CreateXProps`를 사용한다.
- 여러 raw 생성 입력을 domain object 배열로 변환해야 하고 하나라도 유효하지 않으면 전체가 실패해야 할 때는 domain model에 `createMany`를 둔다.
- DDD framework primitive는 재사용 가능한 `protected static construct` helper를 유지할 수 있다.
- persistence/API 변환 관심사는 domain model에 기본 serialization method를 추가하지 말고 mapper에 둔다.
- DDD framework primitive는 `Entity`, `AggregateRoot`, `ValueObject` 같은 framework 이름을 사용할 수 있다.

## 레이어별 메서드

기술 용어가 도메인으로 새어 들어가지 않도록 레이어의 책임에 따라 method 이름을 짓는다.

- Domain method는 CRUD나 persistence detail이 아니라 비즈니스 동작을 설명한다: `changeTitle`, `markAsDeleted`.
- Use case 이름은 사용자 관점의 application action을 설명한다. public method는 `execute`다.
- Infrastructure code는 TypeORM `findOneBy`나 HTTP `post`처럼 외부 API/library 이름을 내부에서 사용할 수 있지만, domain 또는 application port를 통해 노출하지 않는다.

Repository prefix는 결과 형태와 실패 동작을 담고 있으므로 명시적인 규칙이 필요하다.

| Prefix | 사용할 때 |
| --- | --- |
| `save` | 현재 aggregate state를 새로 만들었든 변경했든 persist한다. |
| `findByX` | 단일 결과가 없을 수 있으며 `null` 또는 `undefined`를 반환한다. |
| `getByX` | 결과가 없는 상황이 예외적이다. |
| `listByX` | collection을 반환한다. |
| `countByX` | count를 반환한다. |
| `existsByX` | boolean existence check를 반환한다. |
| `deleteByX` | record를 물리적으로 제거한다. hard delete가 유효할 때만 사용한다. |

기본 repository에 `update`를 추가하지 않는다. aggregate를 변경한 뒤 `save`를 호출한다.
Soft delete는 `markAsDeleted`처럼 aggregate의 domain state change로 표현한 뒤 `save`로 persist한다.
Restore는 `restore`처럼 aggregate의 domain state change로 표현한 뒤 `save`로 persist한다.

## 변수와 타입

- backing field가 getter와 충돌하면 `createdAtValue`, `updatedAtValue`처럼 설명적인 suffix를 사용한다.
- array와 collection에는 복수형 이름을 사용한다: `mistakes`, `records`, `users`.
- `id`는 owning object scope 안에서만 사용한다. 그 밖에서는 `userId`, `postId`처럼 한정한다.
- timestamp에는 `At`을 사용한다: `createdAt`, `updatedAt`, `expiresAt`.
- `Params`, `Props`, `Options`, `Result`, `Payload`는 의미에 따라 사용한다. `RequestDto`와 `ResponseDto`는 API DTO boundary에서만 사용한다.

## Port와 Infrastructure

Port implementation file은 `{port-name}.{technology}.ts`를 따른다. Implementation class는 `TechnologyPrefix + RoleName`을 사용한다.

| Port type | Port file | Implementation file | Implementation class |
| --- | --- | --- | --- |
| `Logger` | `logger.port.ts` | `logger.winston.ts` | `WinstonLogger` |
| `TokenProvider` | `token-provider.port.ts` | `token-provider.jwt.ts` | `JwtTokenProvider` |
| `PostRepository` | `post.repository.port.ts` | `post.repository.typeorm.ts` | `TypeormPostRepository` |

## DI Token

DI token은 `{module}.tokens.ts`에 모으고 `Symbol` 값을 export한다.

- Constant name: `SCREAMING_SNAKE_CASE`, 예: `ACCOUNT_REPOSITORY`.
- Symbol description: `snake_case`, 예: `Symbol('account_repository')`.
- Token과 port는 일대일로 대응한다: `TOKEN_PROVIDER` -> `TokenProvider` -> `token-provider.port.ts`.

```typescript
export const ACCOUNT_REPOSITORY = Symbol('account_repository');
export const TOKEN_PROVIDER = Symbol('token_provider');
```

## DTO와 Controller

- 공유 response DTO는 `src/libs/api/`에 둔다: `IdResponseDto`, `HttpErrorResponse`.
- Controller file은 protocol을 포함한다: `{module}.{protocol}.controller.ts`, 예: `post.http.controller.ts` -> `PostHttpController`.

## 테스트 Helper

테스트 파일과 테스트 케이스 이름은 API 테스트 컨벤션을 따른다.

- Fixture factory: `createXFixture`, 예: `createPostFixture`.
- Mock: `mockX`, 예: `mockTokenProvider`.
- Stub: `stubX`, 예: `stubPasswordHasher`.
- Scenario-specific data는 유용할 때 case를 설명해야 한다: `expiredRefreshToken`, `postWithoutTitle`.
