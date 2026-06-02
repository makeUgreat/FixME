# Naming Convention

Use concise, role-based names. Avoid meta names such as `Impl`, `Adapter`, `Port`, `Aggregate`, `Entity`, or `Vo` in type names unless the word is part of the domain language.

ESLint-enforced naming checks are summarized in the
[API ESLint rules README](../../eslint/README.md#naming-rules).

## Domain Models

- Use singular domain terms for aggregates, entities, and value objects: `Post`, `PostTitle`, `UserEmail`.
- Use `Props` for internal state and `CreateXProps` for creation input.
- Use `createMany` on the domain model when multiple raw creation inputs must be converted into domain objects and any invalid item should fail the whole operation.
- DDD framework primitives may use framework names such as `Entity`, `AggregateRoot`, and `ValueObject`.

## Domain Model Files

Domain model files use kebab-case domain terms plus a role suffix.

| Model role | File pattern | Type name |
| --- | --- | --- |
| Aggregate | `{domain-term}.aggregate.ts` | PascalCase domain term |
| Entity | `{domain-term}.entity.ts` | PascalCase domain term |
| Value object | `{domain-term}.vo.ts` | PascalCase domain term |

Examples:

- `correction.aggregate.ts` -> `Correction`
- `correction-metadata.entity.ts` -> `CorrectionMetadata`
- `correction-feedback.vo.ts` -> `CorrectionFeedback`
- `user-email.vo.ts` -> `UserEmail`

Do not include role words such as `Aggregate`, `Entity`, or `Vo` in concrete
domain model type names unless they are part of the domain language.

These names are enforced by the API ESLint naming rules. See the
[API ESLint rules README](../../eslint/README.md#naming-rules).

## Methods By Layer

Name methods by the layer's responsibility so technical language does not leak into the domain.

- Domain methods describe business behavior, not CRUD or persistence details: `changeTitle`, `markAsDeleted`.
- Use case names describe user-facing application actions. The public method is `execute`.
- Infrastructure code may use external API/library names internally, such as TypeORM `findOneBy` or HTTP `post`, but do not expose them through domain or application ports.

Repository prefixes need explicit rules because they encode result shape and failure behavior.

| Prefix      | Use when                                                           |
| ----------- | ------------------------------------------------------------------ |
| `save`      | Persist the current aggregate state, whether it is new or changed. |
| `findByX`   | A single result may be absent; return `null` or `undefined`.       |
| `getByX`    | Absence is exceptional.                                            |
| `listByX`   | Return a collection.                                               |
| `countByX`  | Return a count.                                                    |
| `existsByX` | Return a boolean existence check.                                  |
| `deleteByX` | Physically remove the record. Use only when hard delete is valid.  |

Do not add `update` to the base repository. Modify the aggregate and call `save`.
For soft delete, express the domain state change on the aggregate, such as `markAsDeleted`, then persist it with `save`.
For restore, express the domain state change on the aggregate, such as `restore`, then persist it with `save`.

## Variables And Types

- If a backing field conflicts with a getter, use a descriptive suffix such as `Value`: `createdAtValue`, `updatedAtValue`.
- Use plural names for arrays and collections: `mistakes`, `records`, `users`.
- Use `id` only inside the owning object scope. Outside that scope, qualify it: `userId`, `postId`.
- Use `At` for timestamps: `createdAt`, `updatedAt`, `expiresAt`.
- Use `Params`, `Props`, `Options`, `Result`, `Payload`, `Request`, and `Response` by meaning.

## File Suffixes

Use file suffixes to describe the file's role, not its implementation detail.

| Suffix | Use when |
| --- | --- |
| `.type.ts` | The file exports only loose helper types or interfaces and no narrower suffix fits. |
| `.constant.ts` | The file owns constants or enum-like `as const` data for one concept. |
| `.util.ts` | The file exports stateless helper functions. |
| `.base.ts` | The file exports foundational shared contracts, base types, or abstract/base classes. |
| `.mapper.ts` | The file exports a mapper class or mapper implementation. |
| `.error.ts` | The file owns feature, use case, or domain error unions. |
| `.request.ts` | The file owns a protocol boundary request shape. |
| `.response.ts` | The file owns a protocol boundary response shape. |
| `.controller.ts` | The file exports a controller class. |
| `.filter.ts` | The file exports a framework or protocol filter class. |
| `.command.ts` | The file owns a CQRS command. |
| `.command-handler.ts` | The file exports a CQRS command handler. |
| `index.ts` | The file is a public barrel or package/lib entrypoint. |

Prefer `.type.ts` over `.interface.ts` only for loose type collections.
If a narrower suffix such as `.base.ts`, `.error.ts`, `.request.ts`, or
`.response.ts` describes the file, use that narrower suffix.
TypeScript `interface` is a type-level construct, while the file suffix should describe the role of the whole file.
Use singular `.constant.ts`, even when the file exports multiple constants,
because the suffix describes the file role.

## Mapper Files And Types

Use `Mapper` for layer boundary translation. Do not introduce a separate role
name such as `Translator` for error translation.

- Mapper files use `{subject}.mapper.ts`. Keep source, target, protocol, and
  category words inside the hyphenated subject.
- Type names should include conversion direction when the mapper performs a
  semantic error conversion.
- Error mapper file names use `-error.mapper.ts` while the class name names
  the conversion direction, such as
  `CreateCorrectionDomainErrorToApplicationErrorMapper`.
- Shared `.base.ts` mapper files may expose a stable shared contract whose name
  describes the conversion direction rather than repeating the file subject.

Examples:

| Boundary | File | Class |
| --- | --- | --- |
| Persistence record <-> domain model | `correction-persistence.mapper.ts` | `CorrectionPersistenceMapper` |
| Domain error -> application error | `create-correction-error.mapper.ts` | `CreateCorrectionDomainErrorToApplicationErrorMapper` |
| Application error -> HTTP error | `correction-http-error.mapper.ts` | `CorrectionHttpErrorMapper` |
| Application result -> HTTP response | `create-correction-http-response.mapper.ts` | `CreateCorrectionHttpResponseMapper` |
| Shared domain error -> application error contract | `application-error-mapper.base.ts` | `DomainErrorToApplicationErrorMapper` |

## Boundary Abstractions And Infrastructure

Boundary abstraction files do not use a `Port` suffix in file names or type
names. Shared foundational boundaries use `.base.ts`; repository boundaries use
`.repository.ts`. Implementation files follow `{boundary-name}.{technology}.ts`.
Implementation classes use `TechnologyPrefix + RoleName`.

| Boundary type    | Boundary file             | Implementation file          | Implementation class    |
| ---------------- | ------------------------- | ---------------------------- | ----------------------- |
| `Logger`         | `logger.base.ts`          | `logger.winston.ts`          | `WinstonLogger`         |
| `TokenProvider`  | `token-provider.base.ts`  | `token-provider.jwt.ts`      | `JwtTokenProvider`      |
| `PostRepository` | `post.repository.ts`      | `post.repository.typeorm.ts` | `TypeormPostRepository` |

## DI Tokens

Collect DI tokens in `{module}.tokens.ts` and export `Symbol` values.

- Constant name: `SCREAMING_SNAKE_CASE`, such as `ACCOUNT_REPOSITORY`.
- Symbol description: `snake_case`, such as `Symbol('account_repository')`.
- Tokens and boundary abstractions map one-to-one: `TOKEN_PROVIDER` -> `TokenProvider` -> `token-provider.base.ts`.

```typescript
export const ACCOUNT_REPOSITORY = Symbol('account_repository');
export const TOKEN_PROVIDER = Symbol('token_provider');
```

## Requests, Responses, And Controllers

- Feature request and response types belong near the controller that owns the protocol boundary.
- Shared response types may be introduced under `src/libs/api/` only when multiple modules need the same stable API shape.
- Controller files include the protocol: `{module-protocol}.controller.ts`, such as `post-http.controller.ts` -> `PostHttpController`.
- Protocol-specific request, response, and error files do not use a `Dto` suffix. Put the protocol inside the hyphenated subject when the shape is protocol-specific, such as `create-correction.request.ts`, `create-correction-http.response.ts`, and `correction-http-error.mapper.ts`.

## Test Helpers

Follow the API test convention for test files and test case names.

- Fixture factories: `createXFixture`, such as `createPostFixture`.
- Mocks: `mockX`, such as `mockTokenProvider`.
- Stubs: `stubX`, such as `stubPasswordHasher`.
- Scenario-specific data should describe the case when useful: `expiredRefreshToken`, `postWithoutTitle`.
