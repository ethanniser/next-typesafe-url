---
title: "Search/Route Params- App"
description: "how to consume params in app via next-typesafe-url"
nextPage:
  text: "Next: Search/Route Params- Pages"
  link: "en/usage/search-route-params-pages"
---

## Versions

While the apis for `app` and `pages` are very similar, there are some important differences.

<h4>Make sure you follow the docs for your use case</h4>

### This page: `app` version

View the `pages` version [here](search-route-params-pages)

## Server Components

### Forced Dynamic Rendering

In `page.tsx`, search params are accessible through props on the top level exported component. However, accessing search params in this way **will force you into dynamic rendering (SSR)**. This is a behavior enforced by Next ([see the "good to know" section at the very bottom](https://nextjs.org/docs/app/api-reference/file-conventions/page#good-to-know))

If you do not want this behavior (_i.e. you want some part of your page to be statically generated at build time or ISR'd_), you are forced to place the search param logic **in a client component**. [Check out the 'Client Components' section below](#client-components) to see more.

### Usage in page.tsx

#### withParamValidation

`next-typesafe-url/app` provides a higher order component `withParamValidation` you can wrap your page with to provide runtime validation through your zod validator.

The `InferPagePropsType` helper type is passed `RouteType` as a generic to extrapolate the valid types coming out of the zod validator.

---

**Note:** If no error is thrown, your PageProps will always be the types you defined in your schema.

**Note:** If your page does not consume any search/route params (i.e. it is a 'static' route), there is no need to use `withParamValidation`

---

```tsx
// app/product/[productID]/page.tsx
import { withParamValidation } from "next-typesafe-url/app";
import type { InferPagePropsType } from "next-typesafe-url";
import { Route, type RouteType } from "./routeType";

type PageProps = InferPagePropsType<RouteType>;

async function Page({ routeParams, searchParams }: PageProps) {
  return (
    <>
      <div>{JSON.stringify(routeParams)}</div>
      <div>{JSON.stringify(searchParams)}</div>
    </>
  );
}

export default withParamValidation(Page, Route);
```

#### Errors

If the zod validation fails, `withParamValidation` will throw a `ZodError`. Use Next's `error.tsx` to handle these thrown errors.

### Usage in layout.tsx

Layouts only have access to route params, not search params ([see why](https://nextjs.org/docs/app/api-reference/file-conventions/page#good-to-know)).

In terms of validation, a layout could represent any number of routes within it, all of which may have their own validators which may not neccesarily overlap.

Because of this, **you** must define a new zod validator for each layout, which accurately represents the union of all possible valid route params for all nested routes.

#### withLayoutParamValidation

`next-typesafe-url/app` provides a higher order component `withLayoutParamValidation` you can wrap your layouts with to provide runtime validation through your zod validator.

The `InferLayoutPropsType` helper type is passed the type of your LayoutRoute as a generic to extrapolate the valid types coming out of the zod validator.

---

**Note:** If no error is thrown, your PageProps will always be the types you defined in your schema.

**Note:** If your layout does not consume any route params, there is no need to use `withLayoutParamValidation`

---

```tsx
// app/product/[productID]/layout.tsx
import { z } from "zod";
import { withLayoutParamValidation } from "next-typesafe-url/app";
import type { DynamicLayout, InferLayoutPropsType } from "next-typesafe-url";

const LayoutRoute = {
  routeParams: z.object({
    productID: z.number(),
  }),
} satisfies DynamicLayout;
type LayoutType = typeof LayoutRoute;

type Props = InferLayoutPropsType<LayoutType>;
async function Layout({ children, routeParams }: Props) {
  return (
    <div>
      <p>{JSON.stringify(routeParams)}</p>
      <div>{children}</div>
    </div>
  );
}

export default withLayoutParamValidation(Layout, LayoutRoute);
```

#### Errors

If the zod validation fails, `withLayoutParamValidation` will throw a `ZodError`. Use Next's `error.tsx` to handle these thrown errors.

## Client Components

_If you don't have a specific reason to need to access params on the Client, it is recommended to use the server patterns found in the ["Server Components" section above](#server-components), but this is just general advice._

### Hooks

`next-typesafe-url/app` exports a `useRouteParams` and `useSearchParams` hook that will return the route params / search params for the current route. They take one argument, the zod schema for either route params or search params from the Route object.

```tsx
import { Route } from "~/app/product/[productID]/routeType.tsx";
import { useSearchParams, useRouteParams } from "next-typesafe-url/app";

function Component() {
  const routeParams = useRouteParams(Route.routeParams);
  const searchParams = useSearchParams(Route.searchParams);
  const { data, isLoading, isError, error } = searchParams;

  if (isLoading) {
    return <div>loading...</div>;
  } else if (isError) {
    return <div>Invalid search params {error.message}</div>;
  } else {
    return <div>{data.userInfo.name}</div>;
  }
}
```

#### Errors

`isLoading` is the loading state of the internal Next router, and `isError` is a boolean that is true if the params do not match the schema. If `isError` is true, then `error` will be a `ZodError` object you can use to get more information about the error. (_also check out [zod-validation-error](https://github.com/causaly/zod-validation-error) to get a nice error message_)

**If `isLoading` is false and `isError` is false, then `data` will always be valid and match the schema.**

---

**Note:** Be mindful when using `useSearchParams` and `useRouteParams` in components used in multiple routes, making sure you pass the correct validator

---

#### IMPORT WARNING

`next-typesafe-url/pages` **ALSO** exports a `useRouteParams` and `useSearchParams` hook, but these are **NOT** the same as the hooks exported from `next-typesafe-url/app`.

<h4>MAKE SURE YOU IMPORT FROM THE RIGHT PATH</h4>

## Advanced Routing Patterns

### Parallel Routes

**`page.tsx` in any parallel routes should use the import from the `routeType.ts` from the parent directory**

This is because they will be shown on the same route, receiving the same route params and search params, and therefore should use the same zod validator.

```
app
├── @analytics
    └── page.tsx  <- THIS SHOULD IMPORT FROM  |
└── layout.tsx                                |
└── page.tsx                                  |
└── routeType.ts <-----------------------------
```

#### Adjusting Layout Props

`InferLayoutPropsType` takes an optional second generic of `string` or a union of `string`s (for multiple parallel routes) that should represent any parallel routes beneath the layout.

```tsx
type Props = InferLayoutPropsType<LayoutType, "analytics">;
function Layout({ children, routeParams, analytics }: Props) {
  return (
    <div>
      <p>{JSON.stringify(routeParams)}</p>
      <div>{children}</div>
      <div>{analytics}</div>
    </div>
  );
}
export default withLayoutParamValidation(Layout, LayoutRoute);
```

### Intercepted Routes

Like parallel routes, **`page.tsx` in any intercepted routes should import from the `routeType.ts` from the directory of the route being intercepted**

This way, whether that route is accessed directly or intercepted, the same validation is used.

```
app
├── @modal
    └── (.)foo
        └── page.tsx  <- THIS SHOULD IMPORT FROM  |
└── layout.tsx                                    |
└── foo                                           |
    └── page.tsx                                  |
    └── routeType.ts <-----------------------------
```

<h4 class="idk-why">Now the pages version:</h4>
<style>
  .idk-why {
    margin-bottom: 40px;
  }
</style>
