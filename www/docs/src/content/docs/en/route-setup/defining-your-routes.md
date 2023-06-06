---
title: "Defining Your Routes"
description: "How to define the valid types for your routes"
nextPage:
  text: "Next: Running the CLI"
  link: "en/route-setup/running-the-cli"
---

## An Enforced Schema

For `next-typesafe-url` to provide full end-to-end routing typesafety, it needs to know the valid types for your routes.

### Static Routes

Any route that does not contain a dynamic segment,or uses search params is considered a static route.

**To define a static route all you have to do is: ...nothing!**

`next-typesafe-url` will automatically infer any routes as static routes if you don't explicitly define a schema for them, like you will for...

### Dynamic Routes

Any route that defines a schema for the valid types of its route or search params is considered a dynamic route.

##### Lets Clarify

**Route Params** the the values of a dynamic route segment, in next they are denoted by square brackets `[]`

```
/users/[id]
```

**Search Params** information that is passed to a route via the query string, in next they are denoted by a question mark `?`

```
/users?id=123
```

#### Defining a Dynamic Route Schema

Exactly where you place the schema depends on whether you are in `app` or `pages`, but we'll get to that in a second.

For now lets just look at what a valid schema looks like.

```ts
// app/product/[productID]/routeType.tsx
import { type DynamicRoute } from "next-typesafe-url";
import { z } from "zod";

const Route = {
  routeParams: z.object({
    productID: z.number(),
  }),
  searchParams: z.object({
    location: z.enum(["us", "eu"]).optional(),
    userInfo: z.object({
      name: z.string(),
      age: z.number(),
    }),
  }),
} satisfies DynamicRoute;
export type RouteType = typeof Route;
```

**_Lets break this down_**

##### Imports

We import two things, first is `z` from [zod](https://zod.dev/). Zod is a best-in-class validation library. We'll use it to define our schema. Second is `DynamicRoute` from `next-typesafe-url`. This is a type that we will use to ensure that `Route` is what `next-typesafe-url` expects.

##### So what does it expect?

`Route` should have either a `routeParams` or `searchParams` property, or both. Each of these properties should be a zod object.

##### `routeParams`

Each key in `routeParams` should be the name of a dynamic route segment for the route the schema is for, and each value should be a zod type that represents the valid type for that segment.

Route params from the url are

**Note:** Catch all and optional catch all routes are interepted as arrays or tuples.

```ts
// app/dashboard/[...options]/routeType.ts
export const Route = {
  routeParams: z.object({
    options: z.tuple([z.string(), z.number()]),
  }),
};
export type RouteType = typeof Route;
```
