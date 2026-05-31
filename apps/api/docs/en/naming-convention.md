# Naming Convention

Use concise, role-based names. Avoid meta names such as `Impl`, `Adapter`, `Port`, `Aggregate`, `Entity`, or `Vo` in type names unless the word is part of the domain language.

## Domain Models

- Use singular domain terms for aggregates, entities, and value objects: `Post`, `PostTitle`, `UserEmail`.
- Use `Props` for internal state and `CreateXProps` for creation input.
- Use `createMany` on the domain model when multiple raw creation inputs must be converted into domain objects and any invalid item should fail the whole operation.
- DDD framework primitives may keep reusable `protected static construct` helpers.
- Keep persistence/API conversion concerns in mappers instead of adding default serialization methods to domain models.
- DDD framework primitives may use framework names such as `Entity`, `AggregateRoot`, and `ValueObject`.

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
- Use `Params`, `Props`, `Options`, `Result`, and `Payload` by meaning. Use `RequestDto` and `ResponseDto` only at API DTO boundaries.

## Ports And Infrastructure

Port implementation files follow `{port-name}.{technology}.ts`. Implementation classes use `TechnologyPrefix + RoleName`.

| Port type        | Port file                 | Implementation file          | Implementation class    |
| ---------------- | ------------------------- | ---------------------------- | ----------------------- |
| `Logger`         | `logger.port.ts`          | `logger.winston.ts`          | `WinstonLogger`         |
| `TokenProvider`  | `token-provider.port.ts`  | `token-provider.jwt.ts`      | `JwtTokenProvider`      |
| `PostRepository` | `post.repository.port.ts` | `post.repository.typeorm.ts` | `TypeormPostRepository` |

## DI Tokens

Collect DI tokens in `{module}.tokens.ts` and export `Symbol` values.

- Constant name: `SCREAMING_SNAKE_CASE`, such as `ACCOUNT_REPOSITORY`.
- Symbol description: `snake_case`, such as `Symbol('account_repository')`.
- Tokens and ports map one-to-one: `TOKEN_PROVIDER` -> `TokenProvider` -> `token-provider.port.ts`.

```typescript
export const ACCOUNT_REPOSITORY = Symbol('account_repository');
export const TOKEN_PROVIDER = Symbol('token_provider');
```

## DTOs And Controllers

- Shared response DTOs belong in `src/libs/api/`: `IdResponseDto`, `HttpErrorResponse`.
- Controller files include the protocol: `{module}.{protocol}.controller.ts`, such as `post.http.controller.ts` -> `PostHttpController`.

## Test Helpers

Follow the API test convention for test files and test case names.

- Fixture factories: `createXFixture`, such as `createPostFixture`.
- Mocks: `mockX`, such as `mockTokenProvider`.
- Stubs: `stubX`, such as `stubPasswordHasher`.
- Scenario-specific data should describe the case when useful: `expiredRefreshToken`, `postWithoutTitle`.
