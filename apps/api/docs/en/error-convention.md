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

When declaring domain error contracts, use the shared `DomainErrorOf` helper
from `@libs/ddd`. Do not spell out `DomainErrorBase<'kind', ...>` or a
handwritten `{ kind; code; message; details }` type outside the shared DDD error
type file. `DomainErrorOf` keeps `DomainErrorKind` as the single source of broad
categories while allowing each domain to narrow its own `owner`, `reason`, and
`details`. For example, use
`DomainErrorOf<typeof DOMAIN_ERROR_KIND.INVARIANT_VIOLATION, 'correction', 'original_text_empty', DomainInvariantViolationDetails>`.
Use the shared `DomainErrorCode` helper instead of hand-writing the template
literal code type.

Use `kind` for broad handling:

| Kind                    | Meaning                                                                   |
| ----------------------- | ------------------------------------------------------------------------- |
| `invariant_violation`   | The input or state would break a rule that must always hold.              |
| `state_conflict`        | The requested operation conflicts with the current domain state.          |
| `operation_not_allowed` | The rule is valid, but the actor or context is not allowed to perform it. |

Use `code` for the precise domain reason. A code should be stable enough for
tests, logs, API responses, and client behavior. Prefer `{domain}.{reason}`.

Domain error objects returned from domain code must include `kind`, `code`,
`message`, and `details`. Use `details: {}` when there is no extra safe
structured context for the caller.

Do not put every domain code in one global union. A shared error kind gives the
application a common handling vocabulary; domain-specific codes should remain
owned by the domain that defines them.

Use `message` as a developer-facing explanation. User-facing text and localized
copy should be mapped outside the domain layer. Non-empty `details` should only
contain safe, structured domain context that a caller needs for branching,
logging, testing, or boundary mapping.

The harness enforces mechanical rules such as the domain error object shape,
code format, domain-layer dependency boundaries, and Result consumption. This
document explains the intent behind those rules rather than repeating every
lintable pattern.

## Enforced Checks

The API app uses lint rules to keep the convention mechanical where possible.
ESLint-enforced error and domain checks are summarized in the
[API ESLint rules README](../../eslint/README.md#domain-rules).

- `neverthrow/must-use-result` requires production code to consume returned
  `Result` values.
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

Do not copy lower-layer `message`, `code`, or raw `details` into an application
error by default. Application errors should expose the use case's stable meaning.
Keep lower-layer diagnostics in logs or dedicated internal context when needed,
not in the public application contract.

Use the shared `ApplicationErrorKind` vocabulary for broad application failure
handling. Start with the smallest stable set and add a new kind only when
multiple use cases need the same orchestration-level meaning. Application error
contracts should use the shared `ApplicationErrorOf` helper from `@libs/layer`,
while each use case owns its exact `owner`, `reason`, and `details`. Application
error codes should use `{owner}.{reason}`; keep the broad category in `kind`.

Use these application error kinds for broad handling:

| Kind                      | Meaning                                                                  |
| ------------------------- | ------------------------------------------------------------------------ |
| `validation_failed`       | The command, query, or translated domain result failed validation.       |
| `dependency_unavailable`  | A required repository, provider, service, or external dependency failed. |
| `not_found`               | A required application resource was not found.                           |
| `state_conflict`          | The request conflicts with current application or workflow state.        |
| `permission_denied`       | The authenticated actor is not allowed to perform the use case.          |
| `authentication_required` | The use case requires an authenticated actor, but none is available.     |
| `operation_not_allowed`   | Application workflow or policy does not allow the operation.             |
| `rate_limited`            | The use case cannot proceed because a rate limit was reached.            |
| `unexpected`              | The failure cannot be meaningfully classified at the boundary.           |

Do not use HTTP status names such as `bad_request` or `internal_server_error` as
application error kinds. HTTP mapping belongs in presentation error mappers.

## Infrastructure Errors

Infrastructure errors are usually technology-shaped: database constraint errors,
network timeouts, SDK exceptions, serialization errors, and similar failures.

Do not let technology-shaped errors leak into domain or application contracts.
Catch or contain them near the infrastructure boundary, then translate them into
an application-level meaning when the caller can make a useful decision.

Infrastructure error contracts should use the shared `InfrastructureErrorOf`
helper from `@libs/layer`. Use adapter-neutral `kind` values that describe the
failure meaning, not the dependency type:

| Kind             | Meaning                                                     |
| ---------------- | ----------------------------------------------------------- |
| `unavailable`    | A required infrastructure dependency is not available.      |
| `timeout`        | A required infrastructure dependency timed out.             |
| `conflict`       | The operation conflicts with dependency state.              |
| `invalid_data`   | Data from or stored in a dependency has an invalid shape.   |
| `restore_failed` | Persisted data could not be restored into the expected model. |
| `bad_response`   | An external dependency returned an unusable response.       |
| `unexpected`     | The failure cannot be meaningfully classified here.         |

Use `code` for source-specific precision, such as
`correction_repository.save_unavailable` or
`openai_client.response_invalid`. Do not encode adapter names such as database,
Redis, S3, or HTTP into `kind`.

Infrastructure errors include top-level `source` metadata for where the failure
occurred. Keep `code` in the stable `{owner}.{reason}` format. For now,
`source` only contains the existing infrastructure boundary,
`boundary: 'persistence'`, and the concrete `adapter`. Keep `details` for
failure-specific safe payload only.

Persistence errors are a narrower infrastructure error family. Persistence
contracts should use `PersistenceErrorOf` from `@libs/layer`, and
`PersistenceErrorBase` must extend `InfrastructureErrorBase`. Persistence
sources always use `boundary: 'persistence'` and include an `adapter`.

Infrastructure error values returned through `Result` must not include raw
causes, SDK errors, SQL details, stack traces, provider payloads, secrets, or
other unsafe dependency diagnostics. Keep those diagnostics in logging or a
separate internal diagnostic policy.

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

Application and domain errors may keep precise internal codes such as
`create_correction.command_invalid` or `correction.original_text_empty`. HTTP
responses should expose the stable public reason code, such as
`validation_failed`, `dependency_unavailable`, or `not_found`, instead of leaking
the internal owner prefix. Keep the precise internal code in logs or other
server-side diagnostics when it is needed for troubleshooting.

Do not reuse domain developer messages as client-facing HTTP messages. Translate
them to protocol-safe copy at the application or presentation boundary.

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
