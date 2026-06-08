---
title: API Error Policy
lang: en
audience: both
applies_to:
  - apps/api
translation: ../ko/error.md
read_when:
  - Defining, mapping, masking, propagating, or reviewing API errors and system errors.
related:
  - ./architecture.md
  - ./source-dependency.md
---

# API Error Policy

Errors are part of the API's control flow and contracts.
Use this document when deciding what a failure means, where it belongs, when it is transformed, and what information it may expose.

## Error And Exception Meaning

This project separates application-controlled errors from failures the application cannot reasonably control.
This distinction follows the project interpretation of IEEE Std 610.12-1990.

- An application-controlled error is a failure value that can occur during normal program execution and can be handled, transformed, recovered from, or exposed by application code or an owning boundary.
- An exception is a thrown or framework-level failure object, such as NestJS `HttpException` or JavaScript `Error`.
- A system error is a severe failure that the application cannot reasonably control or recover from through normal code paths.
- A vendor raw error is a failure value defined by an external adapter, SDK, database, HTTP client, or framework before the application has translated it.
- An error is not a log.
- Logging MAY support failure observability, but logging alone is not failure handling.

Application-controlled failure contracts MUST use error naming, such as `DomainError`, `ApplicationError`, `InfrastructureError`, and `PresentationHttpError`.
Reserve exception naming for thrown objects and external framework types where the project does not own the name.

## Error Categories

Errors are classified first by the boundary that owns their meaning.

- Domain errors describe business rule failures and domain invariant violations.
- Application errors describe use case failures, orchestration failures, and application-owned contract failures.
- Infrastructure errors describe technical adapter failures after they have been translated into an application-controlled shape.
- Presentation errors describe protocol-facing failure responses, such as HTTP responses, GraphQL errors, or request validation failures.

Each layer MAY refine errors by responsibility, bounded context, aggregate, service, adapter, or use case.
This refinement usually changes the error values and codes more than the base data structure.

Failures can also originate outside application-controlled contracts.

- Vendor raw errors are raw failures from external adapters, SDKs, databases, HTTP clients, or frameworks.
- System errors are unexpected runtime, process, network, OS, resource, or environment failures that cannot be handled as a normal application contract.

## Error Transformation

Errors SHOULD be transformed when they cross a boundary where the owner, audience, or contract changes.

- Translate vendor raw errors into infrastructure, port, or application-controlled errors at adapter boundaries when the boundary understands the failure.
- Translate domain errors into application or use case errors when the use case owns the caller-facing meaning.
- Translate application errors into presentation errors or thrown protocol exceptions at protocol boundaries.
- Translate errors crossing independent bounded contexts or modules through the communication contract used by that boundary.
- Presentation boundaries MUST apply masking before exposing errors, exceptions, or system errors to external clients.

Do not add mechanical wrapping only because a call stack crosses an internal folder boundary.
Prefer transformation at controllable boundaries where it improves contract stability, information hiding, ownership, or caller behavior.

The core rule is that handled failures inside the application SHOULD have an application-controlled error shape, and failures sent outside the application MUST use a stable external contract.

## Error Structure

There is no single correct error shape.
When defining an application-controlled error, prefer the following structure unless the owning contract has a reason to differ.

- `code` is a stable, identifiable value used by people and machines to classify the error.
- `message` is human-readable context for debugging, operations, or presentation.
- `details` is structured data for caller behavior or machine processing.

`code` SHOULD be stable within the owning contract.
It SHOULD avoid names that expose internal implementation details, frameworks, vendors, databases, or transient technology choices.
Callers SHOULD depend on `code` instead of parsing `message`.

`message` SHOULD be useful to the human who handles the error.
It MAY change, be localized, be masked, or be rewritten by a later boundary.
Code MUST NOT depend on exact `message` text.

`details` SHOULD contain only structured data that the receiving side is allowed to depend on.
Because `details` becomes part of the contract, keep it minimal and stable.
Validation errors MAY include field-level details when the caller can act on them.

If both public caller behavior and internal diagnosis need structured data, separate the public contract data from internal diagnostic data.
Do not expose internal diagnostic data through presentation errors unless the protocol contract explicitly allows it.

## Unexpected System Errors

Applications cannot know or handle every possible thrown value or failure.
Use a whitelist approach at boundaries.

- Handle and preserve exceptions that the boundary explicitly understands.
- Convert unrecognized failures into a common unexpected or internal error for that boundary's external contract.
- Preserve the original cause when possible.
- Make unrecognized failures observable through logging, metrics, tracing, or another operational signal.
- Normal expected errors do not need to be logged unless the owning boundary's observability policy requires it.
- Do not create silent failures by swallowing unknown failures without handling or observability.

Unexpected system error responses sent outside the application MUST be masked.
The external response should be stable and safe, while the original cause remains available through internal observability.
