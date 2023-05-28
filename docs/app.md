# APP DIRECTORY

## Setup

### IMPORTANT NOTE

**This package REQUIRES your project structure to look like this:**

```
your_project
├── node_modules
└── src
    └── app
```

Add `next-typesafe-url` to your dev and build script in package.json.

For dev mode, you can either run it in a seperate shell, or in one with the [concurrently](https://www.npmjs.com/package/concurrently) package.

```json
{
  "scripts": {
    "build": "next-typesafe-url -a && next build",

    "dev": "concurrently  \"next-typesafe-url -a -w\" \"next dev\"",
    // OR
    "dev:url": "next-typesafe-url -a -w"
  }
}
```

---

**Running this script will build the types for your project.**

_If the functions still show type errors after running the cli, you can restart typescript server, but I have found a quick `crtl+click` to go the origin type file can often wake the ts server up much faster. You may need to do a 2nd `crtl+click` to the type file with the weird looking generated name, as this is where the actual core types are. It should be on the first line of what you first `crtl+click` on_

Worst case senario, you may have to restart your editor. If you are still having problems, please open an issue on github.

---

# Usage

## routeType.ts

`next-typesafe-url` is powered by a `routeType.ts` file in each directory in `app` where you wish to have validated search/route params. Think of this as another one of the built in next `.ts` files, `page.tsx`, `loading.tsx` ... and now `routeType.ts`.

In `routeType.ts` should be 2 statements. The first defines and exports `Route` a object that contains your zod validators. The second exports the type of `Route`.

---

_If a route doesn't need any route params or search params, you dont need to define a `routeType.ts` file_

Any directory in `app` that does not contain a `routeType.ts` will be classified as a `StaticRoute`, and will throw a type error if you try to link to it with any dynamic route params or search params.

---

```ts
// app/product/[productID]/routeType.tsx
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

---

Search params support all valid JSON types. However, **route params are not JSON serializable, so you can only pass strings, numbers, and/or booleans.** _You may also pass an array (of strings, numbers and/or booleans) for catch all routes as shown below._

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

Keep in mind that `next-typesafe-url` assumes your `Route` and `RouteType` are correct. If you for example, have a route param that is a different name than what the actual directory for that route is named, it will cause errors.

**Double check your `Route` objects to make sure they are correct.**

## AppRouter Type

`next-typesafe-url` exports a `AppRouter` type that you can use to get the type of the valid search params and route params for any given route in your app.

```tsx
import { type AppRouter } from "next-typesafe-url";

type ProductIDRouteParams = AppRouter["/product/[productID]"]["routeParams"];
// type ProductIDRouteParams = {
//     productID: number;
// }
```

## Path

`next-typesafe-url` exports a `$path` function that generates a path that can be passed to `next/link` or `next/navigation`'s `useRouter`.

```tsx
import { $path } from "next-typesafe-url";

<Link
  href={$path({
    route: "/product/[productID]",
    routeParams: { productID: 23 },
    searchParams: { userInfo: { name: "bob", age: 23 } },
  })}
/>;

// this generates the following string:
// "/product/23?userInfo=%7B%22name%22%3A%22bob%22%2C%22age%22%3A23%7D"
```

If the route is not a valid route, or any of the route params or search params are missing or of the wrong type, it will throw a type error.

---

**Note:** Strings are passed to the url without quotes, so to provide support for booleans, nulls and numbers there are reserved keywords that are converted to their respective values.

Those keywords are:

- `"true"` -> `true`
- `"false"` -> `false`
- `"null"` -> `null`
- `"<some_numberic_literal>"` -> `number`

**`"undefined"` is not a special keyword**, and will be interpreted as a string if passed as the value of a search param in the URL.

In `$path`, passing undefined as the value of a search param will cause it to be left out of the path.

```typescript

$path({ route: "/" searchParams: { foo: undefined, bar: true } }) // => "/?bar=true"

// ------------------------

// URL: /?bar=undefined
// value of bar will be the string "undefined", not undefined
```

---

## Server Components

In `page.tsx`, search params are accessible through props on the top level exported component. However, accessing search params in this way **will force you into dynamic rendering (SSR)**. This is a behavior enforced by next ([see the "good to know" section at the very bottom](https://nextjs.org/docs/app/api-reference/file-conventions/page#good-to-know))

If you do not want this behavior, you are forced to place the search param logic **in a client component**. Check out the 'Client Components' section below to see more.

### Usage in page.tsx

`next-typesafe-url/app` provides a higher order component `withParamValidation` you can wrap your page with to provide runtime validation through your zod validator.

The `InferPagePropsType` is passed `RouteType` as a generic to extrapolate the valid types coming out of the zod validator.

```tsx
// app/product/[productID]/page.tsx
import { withParamValidation } from "next-typesafe-url/app";
import { InferPagePropsType } from "next-typesafe-url/app";
import { Route, type RouteType } from "./routeType";

type PageProps = InferPagePropsType<RouteType>;

const Page = ({ routeParams, searchParams }: PageProps) => {
  return (
    <>
      <div>{JSON.stringify(routeParams)}</div>
      <div>{JSON.stringify(searchParams)}</div>
    </>
  );
};

export default withParamValidation(Page, Route);
```

#### Errors

If the zod validation fails, `withParamValidation` will throw a `ZodError`. Use Next's `error.tsx` to handle these thrown errors.

### Usage in layout.tsx

Layouts only have access to route params, not search params ([see why](https://nextjs.org/docs/app/api-reference/file-conventions/page#good-to-know)).

In terms of validation, a layout could represent any number of routes within it, all of which may have their own validators which may not neccesarily overlap. Because of this **you** must define a new zod validator for each layout, which accurately represents the union of all possible valid route params for all nested routes.

The `InferLayoutPropsType` is passed the type of your LayoutRoute as a generic to extrapolate the valid types coming out of the zod validator.

```tsx
// app/product/[productID]/layout.tsx
import { z } from "zod";
import {
  withLayoutParamValidation,
  type DynamicLayout,
  type InferLayoutPropsType,
} from "next-typesafe-url/app";

const LayoutRoute = {
  routeParams: z.object({
    productID: z.number(),
  }),
} satisfies DynamicLayout;
type LayoutType = typeof LayoutRoute;

type Props = InferLayoutPropsType<LayoutType>;
function Layout({ children, routeParams }: Props) {
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

---

### If you need your top level page component to NOT BE dynamically rendered (SSR), i.e. you want your top level page component to be statically generated, or ISR'ed, then you can access route/search params within deeper client components via hooks

**If you don't need this it is reccomended to use the server component patterns and pass your route/search params down to other server or client components through props.**

---

`next-typesafe-url/app` exports a `useRouteParams` and `useSearchParams` hook that will return the route params / search params for the current route. They take one argument, the zod schema for either route params or search params from the Route object.

```tsx
import { Route } from "~/app/product/[productID]/routeType.tsx";
import { useSearchParams } from "next-typesafe-url/app";

const Component = () => {
  const params = useSearchParams(Route.searchParams);
  const { data, isLoading, isError, error } = params;

  // if isLoading is false, and isError is false (isValid is true), then data *will* be in the shape of Route.searchParams
  // in this case, data will be { userInfo: { name: string, age: number } }

  if (isLoading) {
    return <div>loading...</div>;
  } else if (isError) {
    return <div>Invalid search params {error.message}</div>;
  } else if (isValid) {
    return <div>{data.userInfo.name}</div>;
  }
};
```

`isLoading` is the loading state of the internal Next router, and `isError` is a boolean that is true if the params do not match the schema. If `isError` is true, then `error` will be a zod error object you can use to get more information about the error. (_also check out [zod-validation-error](https://github.com/causaly/zod-validation-error) to get a nice error message_)

**If `isReady` is true and `isError` is false, then `data` will always be valid and match the schema.**

### **Be mindful when using useSearchParams and useRouteParams in components used in multiple routes, making sure you pass the correct validator**

## Command Line Options

- `-w`: Watch for changes and automatically rebuild.
