# Architecture Convention

Architecture rules keep dependencies flowing in one direction and make layer
boundaries explicit. Domain behavior should stay independent from persistence,
transport, framework, and presentation concerns.

## Layer Boundaries

- Domain code owns business rules and domain language.
- Application code orchestrates use cases and translates domain outcomes into
  application outcomes.
- Infrastructure code talks to databases, SDKs, networks, and other technical
  dependencies.
- Presentation code translates application results and errors into protocol-safe
  responses.
- Shared `libs` must not depend on application modules or bootstrap code.

Domain files must not import Nest, HTTP exceptions, application services,
infrastructure adapters, presentation DTOs, or mapper implementations.
Application files must not depend on infrastructure or presentation adapters.
Infrastructure files must not depend on presentation files.

## Domain Models

Domain models should expose behavior and state needed by the domain. They should
not expose persistence or API serialization methods.

- Use factories such as `create`, `restore`, `of`, and `createMany` to construct
  domain models through validation.
- Keep constructors private by default.
- Keep persistence/API conversion concerns outside domain models.

## Mappers

Mappers keep layer boundaries explicit. They translate one layer's model into
another layer's model without putting persistence, transport, or framework
serialization concerns into domain models.

Use the shared mapper interfaces from `@libs/layer`.

| Interface                 | Boundary                                                     |
| ------------------------- | ------------------------------------------------------------ |
| `PersistenceMapper`       | Infrastructure persistence record <-> domain model           |
| `ApplicationErrorMapper`  | Domain error -> application error                            |
| `PresentationMapper`      | Application or domain-safe output -> response DTO            |
| `PresentationErrorMapper` | Application error -> HTTP-safe response body and status code |

Application mappers may translate domain results or errors into application
results or errors. They should be named for the use case or workflow they serve,
such as `CreateCorrectionErrorMapper`, and must not import Nest or HTTP types.

Mapper logic should stay limited to shape translation and error meaning
translation. Do not make business decisions in mappers.

## Static Checks

The API harness enforces the mechanical parts of this convention.
ESLint-enforced architecture and mapper checks are summarized in the
[API ESLint rules README](../../eslint/README.md#domain-rules) and
[mapper rules section](../../eslint/README.md#mapper-rules).

- Dependency Cruiser enforces layer dependency direction.
- ESLint enforces domain construction and mapper boundary patterns.

## Testing

Architecture-sensitive behavior should be tested at the smallest useful level.
Mapper tests should be pure unit tests that verify exact input and output shape,
including preserved safe `details` fields and HTTP status mapping when the mapper
is a presentation error mapper.
