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
    {context-name}/
      domain/
      application/
      infrastructure/
      presentation/
```

This map is intentionally high-level.
Subdirectories inside each context may differ by feature, adapter type, or framework need.

## Current Compatibility Names

Current source code may still use transitional names until the source tree is renamed.
Interpret these directories by architectural role, not as separate architecture concepts.

| Target concept | Current compatibility names |
| --- | --- |
| `bounded-contexts/{context-name}` | `src/modules/{module-name}` |
| `foundation` and `layer-kernels/*` | `src/libs/result`, `src/libs/id`, `src/libs/ddd`, `src/libs/layer/*` |
| database-related infrastructure or wiring | `src/database`, `src/libs/database` |

## Directory Reading Rules

- Do not read the directory tree as only a technical folder layout.
- First identify the DDD model boundary: bounded context or shared kernel.
- Then identify the dependency boundary: foundation, layer-kernel, bounded-context layer, shared-kernel, or composition-root.
- Use the related convention documents for detailed placement, import, and wiring rules.
