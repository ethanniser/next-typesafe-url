---
title: "next-typesafe-url"
description: "a search param and routing library for next.js"
---

_Now with full support for app directory and server components!_

![next-typesafe-url-example](https://github.com/ethanniser/next-typesafe-url/assets/100045248/682e2a01-7e7f-4e44-adb5-6512b22eaadf)

JSON serializable, fully typesafe, and [zod](https://www.npmjs.com/package/zod) validated URL search params, dynamic route params, and routing for NextJS.

**Big shoutout to [tanstack/router](https://github.com/tanstack/router) and [yesmeck/remix-routes](https://github.com/yesmeck/remix-routes) for inspiration and ideas.**

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

## Installation

```bash
npm install next-typesafe-url
# or
yarn add next-typesafe-url
# or
pnpm add next-typesafe-url
```

## Usage

Please refer to the docs page for the version of next-typesafe-url you are using:

### [App](/en/app)

### [Pages](/en/pages)

## Issues

Please [open an issue](https://github.com/ethanniser/next-typesafe-url/issues) if you find a bug or have a feature request.
You can also DM me on twitter [@ethanniser](https://twitter.com/ethanniser) with any questions or concerns.

## Contributing

All contributions are welcome! Please open an issue or submit a PR.

## License

[MIT](https://github.com/ethanniser/next-typesafe-url/blob/main/LICENSE)

## TODO

- add tests
- [`remix-routes` style typescript plugin](https://github.com/yesmeck/remix-routes/tree/master/packages/typescript-remix-routes-plugin) to improve autocomplete and add 'go to definition' to route string (would take you to the route file)
