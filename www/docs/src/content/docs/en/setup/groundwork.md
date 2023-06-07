---
title: "Groundwork"
description: "the whys and hows of next-typesafe-url"
nextPage:
  text: "Next: Defining Your Routes"
  link: "en/setup/defining-your-routes"
---

## On the Same Page

Before we even touch any code, I want to clarify some terminology and make sure we're all on the same page.

Lets look at that juicy tagline again so we can break it down:

> Fully typesafe, JSON serializable, and [zod](https://www.npmjs.com/package/zod) validated URL search params, dynamic route params, and routing for NextJS.

### Lets Start With the Second Half

#### Route Params

The the values of a dynamic route segment, in nextjs they are denoted by square brackets `[]`

```
/users/[id]
```

#### Search Params

Information that is passed to a route via the query string, in next they are denoted by a question mark `?`

```
/users?id=123
```

#### Routing

Routing is the process of navigating between pages in your nextjs app. This is mopst often done either through the use of the `next/link` component.

```tsx
import Link from "next/link";
<Link href={`/users/${id}`} />;
```

### Now the First 3 Big Points

#### Fully Typesafe

Typesafe routing for nextjs has existed in the past with packages like [next-static-paths](https://github.com/Schniz/next-static-paths), [pathpida](https://github.com/aspida/pathpida), and even an [experimental official implementation](https://github.com/aspida/pathpida).

However, these packages all have one thing in common, they only provide typesafety to the path you pass to `next/link`.

When it comes time to actually consume route and search params, you are left empty handed.

```ts
type allCurrentSearchAndRouteParamAPIs = Record<
  string,
  string | string[] | undefined
>;
// ^ this is a nightmare
```

`next-typesafe-url` provides full **end-to-end** typesafety for all of your routes and search params, with the help of...

#### Zod Validated

[Zod](https://zod.dev/) is a best-in-class typescript validation library. It allows you to define schemas for your data and then validate that data against those schemas.

**Using zod means you either get the data you expect, or you get an error, period.**

`next-typesafe-url` implements zod seemlessly meaning all you have to think about is defining your schema, and consuming the data in that shape.

#### JSON Serializable

Lets look at what current APIs for consuming route and search params look like again:

```ts
type allCurrentSearchAndRouteParamAPIs = Record<
  string,
  string | string[] | undefined
>;
```

Current APIs limit what you can do with search and route params.

That's why `next-typesafe-url` embraces JSON as the primary data format for route and search params.

**Any** valid JSON type can be passed as a search or route param. That means: strings, numbers, booleans, nulls, arrays, and objects.
