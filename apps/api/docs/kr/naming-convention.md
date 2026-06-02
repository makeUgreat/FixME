# 네이밍 컨벤션

간결하고 역할이 드러나는 이름을 사용한다. 
`Impl`, `Adapter`, `Port`, `Aggregate`, `Entity`, `Vo` 같은 메타 이름은 해당 단어가 도메인 언어의 일부가 아니라면 type name에 사용하지 않는다.

ESLint로 강제되는 네이밍 검사는 [API ESLint rules README](../../eslint/README.kr.md#naming-rules)에 정리한다.

## 도메인 모델

- aggregate, entity, value object에는 단수 도메인 용어를 사용한다: `Post`, `PostTitle`, `UserEmail`.
- 내부 상태에는 `Props`, 생성 입력에는 `CreateXProps`를 사용한다.
- 여러 raw 생성 입력을 domain object 배열로 변환해야 하고 하나라도 유효하지 않으면 전체가 실패해야 할 때는 domain model에 `createMany`를 둔다.
- DDD framework primitive는 `Entity`, `AggregateRoot`, `ValueObject` 같은 framework 이름을 사용할 수 있다.

## 도메인 모델 파일

도메인 모델 파일은 kebab-case 도메인 용어와 role suffix를 사용한다.

| Model role | File pattern | Type name |
| --- | --- | --- |
| Aggregate | `{domain-term}.aggregate.ts` | 도메인 용어의 PascalCase |
| Entity | `{domain-term}.entity.ts` | 도메인 용어의 PascalCase |
| Value object | `{domain-term}.vo.ts` | 도메인 용어의 PascalCase |

예:

- `correction.aggregate.ts` -> `Correction`
- `correction-metadata.entity.ts` -> `CorrectionMetadata`
- `correction-feedback.vo.ts` -> `CorrectionFeedback`
- `user-email.vo.ts` -> `UserEmail`

`Aggregate`, `Entity`, `Vo` 같은 role 단어는 도메인 언어의 일부가 아니라면 concrete domain model type name에 포함하지 않는다.

이 이름은 API ESLint naming rule로 강제한다. 자세한 강제 규칙은
[API ESLint rules README](../../eslint/README.kr.md#naming-rules)를 참고한다.

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
- `Params`, `Props`, `Options`, `Result`, `Payload`, `Request`, `Response`는 의미에 따라 사용한다.

## 파일 Suffix

파일 suffix는 구현 세부가 아니라 파일의 역할을 설명해야 한다.

| Suffix | 사용할 때 |
| --- | --- |
| `.type.ts` | 더 좁은 suffix가 맞지 않는 loose helper type 또는 interface 모음 파일. |
| `.constant.ts` | 하나의 개념에 대한 constant 또는 enum-like `as const` data를 소유하는 파일. |
| `.util.ts` | state 없는 helper function을 export하는 파일. |
| `.base.ts` | foundational shared contract, base type, abstract/base class를 export하는 파일. |
| `.mapper.ts` | mapper class 또는 mapper implementation을 export하는 파일. |
| `.error.ts` | feature, use case, domain의 error union을 소유하는 파일. |
| `.request.ts` | protocol boundary request shape를 소유하는 파일. |
| `.response.ts` | protocol boundary response shape를 소유하는 파일. |
| `.controller.ts` | controller class를 export하는 파일. |
| `.filter.ts` | framework 또는 protocol filter class를 export하는 파일. |
| `.command.ts` | CQRS command를 소유하는 파일. |
| `.command-handler.ts` | CQRS command handler를 export하는 파일. |
| `index.ts` | public barrel 또는 package/lib entrypoint. |

Loose type collection에는 `.interface.ts`보다 `.type.ts`를 선호한다.
`.base.ts`, `.error.ts`, `.request.ts`, `.response.ts`처럼 더 좁은 suffix가
파일 역할을 설명하면 그 suffix를 우선한다. TypeScript `interface`는 type-level construct이고, 파일 suffix는 파일 전체의 역할을 설명해야 한다.
파일이 여러 constant를 export하더라도 suffix는 파일 역할을 나타내므로 단수형 `.constant.ts`를 사용한다.

## Mapper 파일과 타입

Layer boundary translation에는 `Mapper`를 사용한다. Error translation에
`Translator` 같은 별도 role name을 도입하지 않는다.

- Mapper file은 `{subject}.mapper.ts`를 사용한다. Source, target, protocol,
  category 단어는 hyphenated subject 안에 둔다.
- Type name은 semantic error conversion을 수행할 때 변환 방향을 포함해야 한다.
- Error mapper file name은 `-error.mapper.ts`를 사용하고, class name은
  `CreateCorrectionDomainErrorToApplicationErrorMapper`처럼 변환 방향을 드러낸다.

예:

| Boundary | File | Class |
| --- | --- | --- |
| Persistence record <-> domain model | `correction-persistence.mapper.ts` | `CorrectionPersistenceMapper` |
| Domain error -> application error | `create-correction-error.mapper.ts` | `CreateCorrectionDomainErrorToApplicationErrorMapper` |
| Application error -> HTTP error | `correction-http-error.mapper.ts` | `CorrectionHttpErrorMapper` |
| Application result -> HTTP response | `create-correction-http-response.mapper.ts` | `CreateCorrectionHttpResponseMapper` |

## Boundary Abstraction과 Infrastructure

Boundary abstraction file은 file name이나 type name에 `Port` suffix를 붙이지
않는다. Shared foundational boundary는 `.base.ts`, repository boundary는
`.repository.ts`를 사용한다. Implementation file은 `{boundary-name}.{technology}.ts`를
따른다. Implementation class는 `TechnologyPrefix + RoleName`을 사용한다.

| Boundary type | Boundary file | Implementation file | Implementation class |
| --- | --- | --- | --- |
| `Logger` | `logger.base.ts` | `logger.winston.ts` | `WinstonLogger` |
| `TokenProvider` | `token-provider.base.ts` | `token-provider.jwt.ts` | `JwtTokenProvider` |
| `PostRepository` | `post.repository.ts` | `post.repository.typeorm.ts` | `TypeormPostRepository` |

## DI Token

DI token은 `{module}.tokens.ts`에 모으고 `Symbol` 값을 export한다.

- Constant name: `SCREAMING_SNAKE_CASE`, 예: `ACCOUNT_REPOSITORY`.
- Symbol description: `snake_case`, 예: `Symbol('account_repository')`.
- Token과 boundary abstraction은 일대일로 대응한다: `TOKEN_PROVIDER` -> `TokenProvider` -> `token-provider.base.ts`.

```typescript
export const ACCOUNT_REPOSITORY = Symbol('account_repository');
export const TOKEN_PROVIDER = Symbol('token_provider');
```

## Request, Response, Controller

- Feature request와 response type은 해당 protocol boundary를 소유한 controller 가까이에 둔다.
- Shared response type은 여러 module이 같은 안정적인 API shape를 필요로 할 때만 `src/libs/api/` 아래에 도입할 수 있다.
- Controller file은 protocol을 포함한다: `{module-protocol}.controller.ts`, 예: `post-http.controller.ts` -> `PostHttpController`.
- Protocol-specific request, response, error file은 `Dto` suffix를 사용하지 않는다. Protocol-specific shape이면 `create-correction.request.ts`, `create-correction-http.response.ts`, `correction-http-error.mapper.ts`처럼 protocol을 hyphenated subject 안에 둔다.

## 테스트 Helper

테스트 파일과 테스트 케이스 이름은 API 테스트 컨벤션을 따른다.

- Fixture factory: `createXFixture`, 예: `createPostFixture`.
- Mock: `mockX`, 예: `mockTokenProvider`.
- Stub: `stubX`, 예: `stubPasswordHasher`.
- Scenario-specific data는 유용할 때 case를 설명해야 한다: `expiredRefreshToken`, `postWithoutTitle`.
