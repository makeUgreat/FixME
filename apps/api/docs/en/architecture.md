---
title: API Architecture Convention
lang: en
audience: both
applies_to:
  - apps/api
translation: ../ko/architecture.md
related:
  - ./ddd.md
  - ./source-dependency.md
  - ./runtime-wiring.md
---

# API Architecture Convention

API architecture rules are split across two axes:

- DDD model boundaries define where a model, language, and responsibility are valid.
- Dependency and layer boundaries define which code may depend on which other code.

Read both axes before adding a new bounded context, moving domain code, or introducing shared code.

## Related Documents

- [DDD Convention](./ddd.md): bounded contexts, implementation modules, shared kernel, and domain model rules.
- [Source Dependency Convention](./source-dependency.md): import direction, layer boundaries, and framework import rules.
- [Runtime Wiring Convention](./runtime-wiring.md): NestJS DI, provider registration, bootstrap, and port binding rules.

## Target Structure

The target API source structure is:

```text
src/
  foundation/
  layer-kernels/
    domain/
    application/
    infrastructure/
    presentation/
  shared-kernel/
  composition-root/
    nest/
      app.module.ts
      main.ts
      config/
      filters/
      interceptors/
      guards/
      pipes/
  bounded-contexts/
    corrections/
      domain/
      application/
        commands/
        queries/
      infrastructure/
        persistence/
          postgres-drizzle/
        messaging/
        external/
      presentation/
        http/
          controllers/
          dto/
          mappers/
    users/
      domain/
      application/
      infrastructure/
      presentation/
```

Current code may still use transitional directories such as `src/modules/*`, `src/libs/ddd`, `src/libs/layer/*`, `src/libs/result`, and `src/database`.
Treat those directories as compatibility names for the architecture concepts in this convention until the source tree is renamed.

## Directory Reading Rules

- Do not read the directory tree as only a technical folder layout.
- First identify the DDD model boundary: bounded context or shared kernel.
- Then identify the dependency boundary: foundation, layer-kernel, bounded-context layer, shared-kernel, or composition-root.
- `bounded-contexts/{context}` directories represent DDD model boundaries in the target structure.
- NestJS modules and other implementation modules are code wiring units inside a bounded context. They are not separate DDD model boundaries by default.
- `composition-root` is not a business layer. It only bootstraps the app and wires runtime modules.

## Common Directory Rules

- Do not use `common` or `shared` as a large catch-all directory.
- Put layer-free primitives in `foundation`.
- Put layer-specific shared policy under `layer-kernels/`.
- Put domain-layer common policy in `layer-kernels/domain`.
- Put application-layer common contracts in `layer-kernels/application`.
- Put infrastructure-layer common adapter policy in `layer-kernels/infrastructure`.
- Put presentation-layer common policy in `layer-kernels/presentation`.
- Put feature-specific rules inside the owning bounded context.
- Keep `shared-kernel` empty except for `.gitkeep` unless multiple bounded contexts intentionally share a small domain model.
