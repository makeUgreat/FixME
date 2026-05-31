# Error Convention

Errors should make failure explicit, local to the layer that understands it, and
easy to translate at boundaries. The goal is not to remove every exception. The
goal is to prevent expected business failures from becoming hidden control flow.

## Core Principles

- Represent expected, recoverable failures as values.
- Reserve exceptions for programming errors, framework misuse, and failures that
  cannot be handled meaningfully at the current layer.
- Name failures by what they mean in the current layer, not by the technology
  that produced them.
- Translate errors when crossing a layer boundary instead of leaking lower-layer
  details upward.
- Prefer error shapes that support exhaustive branching and stable client-facing
  codes.

## Result

Use `Result` when the caller is expected to handle both success and failure.
This makes the failure path part of the function contract.

Use `Result` for domain decisions, use case outcomes, and other predictable
branches. Do not use nullable values, boolean flags, magic strings, or thrown
exceptions to mean "this business operation failed in an expected way."

Do not force every function to return `Result`. Pure calculations with no
meaningful failure path can return plain values. Functions that signal programmer
mistakes may still throw.

When consuming a `Result`, branch explicitly. The reader should be able to see
where the success path and failure path diverge.

## Domain Errors

Domain errors describe why a domain rule refused an operation. They should be
expressed in domain language and kept close to the aggregate, entity, value
object, or domain service that owns the rule.

Use a discriminated union so callers can branch by category while still keeping
the exact reason in a stable code. The shared `DomainError` type provides a
common vocabulary across domains; each domain owns its exact error codes and any
structured `details` it needs.

Use `kind` for broad handling:

| Kind                    | Meaning                                                                   |
| ----------------------- | ------------------------------------------------------------------------- |
| `invariant_violation`   | The input or state would break a rule that must always hold.              |
| `state_conflict`        | The requested operation conflicts with the current domain state.          |
| `operation_not_allowed` | The rule is valid, but the actor or context is not allowed to perform it. |

Use `code` for the precise domain reason. A code should be stable enough for
tests, logs, API responses, and client behavior. Prefer `{domain}.{reason}`.

Domain error objects returned from domain code must include `kind`, `code`, and
`message`. `details` is optional and should be present only when the extra
structured context is safe and useful to the caller.

Do not put every domain code in one global union. A shared error kind gives the
application a common handling vocabulary; domain-specific codes should remain
owned by the domain that defines them.

Use `message` as a developer-facing explanation. User-facing text and localized
copy should be mapped outside the domain layer. Use `details` only for safe,
structured domain context that a caller needs for branching, logging, testing,
or boundary mapping.

The harness enforces mechanical rules such as the domain error object shape,
code format, domain-layer dependency boundaries, and Result consumption. This
document explains the intent behind those rules rather than repeating every
lintable pattern.

## Enforced Checks

The API app uses lint rules to keep the convention mechanical where possible.

- `neverthrow/must-use-result` requires production code to consume returned
  `Result` values.
- `domain/domain-error-shape` requires domain `err({ ... })` objects to include
  `kind`, `code`, and `message`, restricts `kind` to the supported domain
  categories, and requires `code` to follow `{domain}.{reason}`.
- `domain/no-global-domain-error-codes` prevents
  `src/libs/ddd/domain.error.ts` from becoming a registry of domain-specific
  codes. Shared DDD codes such as `entity.*` may stay there; feature-domain
  codes should live in the feature domain.
- `domain/split-multiple-validation-errors` keeps `validateProps` readable by
  requiring multiple validation failures to be split into named validation
  methods instead of returning many `err(...)` values directly.
- Domain files must not import Nest or HTTP exceptions. Map domain and
  application failures at the API boundary.

## Application Errors

Application errors describe failures in orchestration: authentication,
authorization, workflow policy, dependency availability after translation, and
coordination between domains or external systems.

Do not reuse a domain error when the failure is not a domain rule. A use case can
return domain errors from the domain it calls, but failures introduced by the use
case itself should be application errors.

Application code should decide whether a lower-layer failure is meaningful to the
user, retriable, forbidden, unavailable, or unexpected. That decision belongs at
the layer with enough context to make it.

## Infrastructure Errors

Infrastructure errors are usually technology-shaped: database constraint errors,
network timeouts, SDK exceptions, serialization errors, and similar failures.

Do not let technology-shaped errors leak into domain or application contracts.
Catch or contain them near the infrastructure boundary, then translate them into
an application-level meaning when the caller can make a useful decision.

It is acceptable for infrastructure code to use exceptions internally when the
dependency API is exception-based. The convention is about what crosses the
boundary, not about pretending external libraries are pure.

## API Errors

API errors are a presentation concern. They should expose stable, client-safe
information and hide internal implementation details.

Do not import HTTP exceptions into domain or application code. Map domain and
application errors to HTTP status codes at the controller, presenter, or
exception-filter boundary.

Expose stable error codes. Treat messages as user-facing text only when they are
safe and intentional. Keep internal diagnostics in logs.

HTTP status mapping should follow the meaning of the error, not the source file
where it occurred. For example, a domain state conflict usually maps differently
from an invariant violation.

## Testing

Expected failures should be tested as returned values. Verify both the broad
category and the precise code when the failure is part of the contract.

Use exception assertions only when the behavior is intentionally exceptional:
programming mistakes, invalid framework usage, or explicitly unrecoverable
failures.

Failure tests should describe the business condition in the test name. They
should not depend on incidental infrastructure messages unless the message is a
deliberate public contract.
