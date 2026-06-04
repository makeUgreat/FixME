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

This document is the API architecture map.
Use the linked documents for detailed rules.

API architecture is described across two axes:

- DDD model boundaries define where a model, language, and responsibility are valid.
- Dependency and layer boundaries define which code may depend on which other code.

Read the DDD rules when model ownership, domain language, or shared domain concepts change.
Read the source dependency and runtime wiring rules when imports, layer placement, provider wiring, or framework boundaries change.

## Related Documents

- [DDD Convention](./ddd.md): bounded contexts, implementation modules, shared kernel, and domain model rules.
- [Source Dependency Convention](./source-dependency.md): import direction, layer boundaries, and framework import rules.
- [Runtime Wiring Convention](./runtime-wiring.md): NestJS DI, provider registration, bootstrap, and port binding rules.

## Target Structure

The target API source map is:

```text
src/
  main.ts
  core/
  layer-kernels/
    domain/
    application/
    infrastructure/
    presentation/
  shared-kernel/
  bootstrap/
    nest/
      app.module.ts
      start-nest-app.ts
      config/
      filters/
      interceptors/
      guards/
      pipes/
  contexts/
    {context-name}/
      domain/
      application/
      infrastructure/
      presentation/
```

This map is intentionally high-level.
Subdirectories inside each context may differ by feature, adapter type, or framework need.

## Directory Reading Rules

- Do not read the directory tree as only a technical folder layout.
- First identify the DDD model boundary: bounded context or shared kernel.
- Then identify the dependency boundary: core, layer-kernel, context layer, shared-kernel, or bootstrap.
- Use the related convention documents for detailed placement, import, and wiring rules.
