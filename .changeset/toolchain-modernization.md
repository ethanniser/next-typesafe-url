---
"next-typesafe-url": patch
---

Rebuild with a modernized toolchain (TypeScript 6, tsup 8) and minor type-level cleanups surfaced by typescript-eslint 8 (`parseOrMapParse`/`parseMapObject` signatures collapse `unknown | unknown[]` to the equivalent `unknown`). No behavior changes.
