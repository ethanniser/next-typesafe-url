---
title: "Defining Your Routes"
description: "How to define the valid types for your routes"
nextPage:
  text: "Next: Running the CLI"
  link: "en/setup/running-the-cli"
---

## An Enforced Schema

For `next-typesafe-url` to provide full end-to-end routing typesafety, it needs to know the valid types for your routes.

### Static Routes

Any route that does not contain a dynamic segment,or uses search params is considered a static route.

**To define a static route all you have to do is: ...nothing!**

`next-typesafe-url` will automatically infer any routes as static routes if you don't explicitly define a schema for them, like you will for...

### Dynamic Routes

Any route that defines a schema for the valid types of its route or search params is considered a dynamic route.

#### Defining a Dynamic Route Schema

Exactly where you place the schema depends on whether you are in `app` or `pages`, but we'll get to that in a bit.

For now lets just look at what a valid schema looks like.

```ts
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

We import two things, first is `z` from [zod](https://zod.dev/), which gives us the primitives to define our schema. Second is `DynamicRoute` from `next-typesafe-url`. This is a type that we will use to ensure that `Route` is what `next-typesafe-url` expects.

##### So what does it expect?

`Route` should have two keys, `routeParams` and `searchParams`, both of which should be either zod objects or undefined (feel free to leave either key out if it can be left undefined).

**Don't make the top level zod objects optional**, if you wan't to make it so a route could _optionally_ take no search params or route params, then simply make each item inside the zod object optional, and `next-typesafe-url` will automatically infer the whole object as optional.

##### `routeParams`

Each key in `routeParams` should be the name of a dynamic route segment for the route the schema is for, and each value should be a zod type that represents the valid type for that segment.

---

**Note:** Catch all and optional catch all routes are interepted as arrays or tuples.

```ts
// app/dashboard/[...options]/routeType.ts
export const Route = {
  routeParams: z.object({
    options: z.tuple([z.string(), z.number()]),
  }),
};
export type RouteType = typeof Route;
// /dashboard/deployments/2 will match and return { options: ["deployments", 2] }
```

---

##### `searchParams`

Each key in `searchParams` should be the name of a valid search param for the route the schema is for, and each value should be a zod type that represents the valid type for that search param.

---

**Note:** When the same search param is used multiple times, it is interpreted as an array or tuple.

```ts
// app/dashboard/routeType.ts
export const Route = {
  searchParams: z.object({
    names: z.array(z.string()),
  }),
};
export type RouteType = typeof Route;
// /dashboard?names=John&names=Jane will match and return { names: ["John", "Jane"] }
```

To be honest not sure why you would want to do this because of JSON support, but it's there if you need it.

---

**Note:** A search param that exists in the url, but has no value ( `?foo` ) will be interpreted as `undefined`.

---

### Double Check Your Schema

Keep in mind that `next-typesafe-url` assumes your `Route` and `RouteType` are correct and match with the names of corresponding routing directories.

If you for example, have a route param that is a different name than what the actual directory for that route is named, it will cause errors.

**Double check your `Route` objects to make sure they are correct.**

### Version Specifics

Depending on what router you are using, the exact location your schema will go will be different.

Theres nothing wrong with using both `app` and `pages` in the same project, just make sure you follow the correct procedure for routes in each.

#### App

In the `app` directory, you will define your schemas in a file called `routeType.ts`. Think of this as another one of the built in next `.ts` files, `page.tsx`, `loading.tsx` ... and now `routeType.ts`.

In `routeType.ts` should be 2 statements. The first defines and exports `Route`, an object that contains your zod schema. The second exports `RouteType` the type of `Route`.

##### Example

```ts
// app/product/[productID]/routeType.ts
import { type DynamicRoute } from "next-typesafe-url";
import { z } from "zod";

export const Route = {
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

Follow this structure for all dynamic routes in the `app` directory, again if a route is static, you don't need to create a `routeType.ts` file for it.

#### Pages

In the `pages` directory, you will define your schemas in the same file as the page itself.

In that file should be 2 statements. The first defines but **DOES NOT EXPORT** `Route`, an object that contains your zod schema. The second exports `RouteType` the type of `Route`.

```ts
// pages/product/[productID].tsx
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

---

**Note:** The reason for specifc disallowance of exporting in `pages` due to the fact that pages doesn't necessarily have a directory for each route, so it would be exetremely inconvenient to define the schema in a seperate file. With that fact, if you export `Route` in a page, and import it somewhere else it will break next's hot reloading, which is not ideal.

---

<h4>Finally, we just need to run the cli to generate some code<h4>
