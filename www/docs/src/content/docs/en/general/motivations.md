---
title: "Motivations"
description: "why next-typesafe-url?"
nextPage:
  text: "Next: Installation"
  link: "en/general/installation"
---

## Whats wrong with curent solutions?

### Routing

Next.js's non-typesafe routing can lead to runtime errors and make it difficult to catch routing-related issues during development, as it relies on string literals instead of type-safe constructs.

### Search Params

_from [tanstack/router](https://tanstack.com/router/v1/docs/guide/search-params):_

Traditional Search Param APIs usually assume a few things:

- Search params are always strings
- They are mostly flat
- Serializing and deserializing using URLSearchParams is good enough (Spoiler alert: it's not, it sucks)

## Typesafety Isn’t Optional

### How does `next-typesafe-url` solve these problems?

- **Fully typesafe routing-** all the way from the route, to the route params, to the search params
- Search params are JSON-first, so you can pass strings, numbers, booleans, nulls, **and even nested objects and arrays**
- Search and route params are **validated at runtime using zod**, so you can be sure that **the data you get matches the schema you expect**
