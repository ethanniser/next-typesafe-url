---
"next-typesafe-url": minor
---

correctly infers zod inputs and outputs, mainly affects using `$path` with zod coercion/transform. Now exposes seperate `RouterInputs` and `RouterOutputs` types to account for this change
