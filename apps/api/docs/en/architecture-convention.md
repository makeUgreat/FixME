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
infrastructure adapters, presentation request/response types, or mapper implementations.
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

Use the shared mapper contracts from `@libs/layer`.

| Contract                  | Boundary                                                    |
| ------------------------- | ----------------------------------------------------------- |
| `ApplicationMapper`       | Generic application-layer input -> application-layer output |
| `PersistenceMapper`       | Infrastructure persistence record <-> domain model          |
| `DomainErrorToApplicationErrorMapper` | Domain error -> application error              |
| `PresentationMapper`      | Generic presentation-layer input -> presentation-layer output |

Application mappers may translate domain results or errors into application
results or errors. Use `ApplicationMapper` as the broad application mapper
contract when no narrower shared contract exists. Application mappers should be
named for the use case or workflow they serve and must not import Nest or HTTP
types.
Domain error to application error mappers extend the shared
`DomainErrorToApplicationErrorMapper` abstract class and declare domain error
`kind` handlers exhaustively, so newly added error kinds require an explicit
application error mapping.

Mapper logic should stay limited to shape translation and error meaning
translation. Do not make business decisions in mappers.

Use `PresentationMapper` as the broad presentation mapper contract when no
narrower shared contract exists. Adapter-specific presentation mappers should
hang off a narrower abstract class, such as `PresentationHttpErrorMapper`, and
may expose adapter-native methods such as `toException`.

Protocol-safe success responses should be owned by the feature presentation
adapter that returns them. Introduce a shared response type only when multiple
modules need the same stable response shape.

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
including preserved safe `details` fields and transport-specific status mapping
when the mapper targets a protocol such as HTTP.
