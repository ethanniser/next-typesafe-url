# next-typesafe-url

JSON serializable, fully typesafe, and [zod](https://www.npmjs.com/package/zod) validated URL search params, dynamic route params, and routing for NextJS

**Big shoutout to [tanstack/router](https://github.com/tanstack/router) and [yesmeck/remix-routes](https://github.com/yesmeck/remix-routes) for inspiration and ideas.**

## Whats wrong with curent solutions?

### Routing

Typesafe routing in NextJS is nonexistant. What we do have currently is a pain. You have to manually type out the route params and search params for each route, and if you make a mistake, you will get a runtime error.

### Search Params

_from [tanstack/router](https://tanstack.com/router/v1/docs/guide/search-params):_

Traditional Search Param APIs usually assume a few things:

- Search params are always strings
- They are mostly flat
- Serializing and deserializing using URLSearchParams is good enough (Spoiler alert: it's not, it sucks)

### How does `next-typesafe-url` solve these problems?

- Fully typesafe routing, from the path to the route params to the search params
- Search params (and technically route params too) are JSON-first, so you can pass numbers, booleans, nulls, and even nested objects and arrays
- Search and route params are validated at runtime using zod, so you can be sure that the data you are getting is valid

## Installation

```bash
npm install next-typesafe-url
# or
yarn add next-typesafe-url
# or
pnpm add next-typesafe-url
```

## Setup

---

**Note:** This package requires you to run your npm scripts from the root directory of your project, as well as your `pages` directory being in `root/src`.

---

Add `next-typesafe-url` to your dev and build script in package.json.

You can either run it seperately in a 2nd terminal:

```json
{
  "scripts": {
    "url:build": "next-typesafe-url",
    "url:watch": "next-typesafe-url -w"
  }
}
```

Or use [`concurrently`](https://www.npmjs.com/package/concurrently) to run it in parallel with your next script:

```json
{
  "scripts": {
    "build": "next-typesafe-url && next build",
    "dev": "concurrently \"next dev\" \"next-typesafe-url -w\""
  }
}
```

# Usage

## Route

`next-typesafe-url` is powered by exporting a special `Route` object from each route in your `pages` directory.

**Note: `Route` should only ever contain the keys of either `routeParams` or `searchParams`, or both, and they should only ever be Zod objects.**

_If a route doesn't need any route params or search params, you dont need to export a `Route` object_

Any page that does not export a `Route` object will be classified as a `StaticRoute`, and will throw a type error if you try to link to it with any dynamic route params or search params.

```ts
// pages/product/[productID].tsx

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
};
```

**Note:** Catch all and optional catch all routes are interepted as arrays or tuples.

```ts
// pages/dashboard/[...options].tsx
export const Route = {
  routeParams: z.object({
    options: z.tuple([z.string(), z.number()]),
  }),
};

// /dashboard/deployments/2 will match and return { options: ["deployments", 2] }
```

## Path

`next-typesafe-url` exports a `$path` function that generates a path that can be passed to `next/link` or `next/router`.

```tsx
import { $path } from "next-typesafe-url";

<Link
  href={$path({
    path: "/product/[productID]",
    routeParams: { productID: 23 },
    searchParams: { userInfo: { name: "bob", age: 23 } },
  })}
/>;

//this generates the following href: /product/23?userInfo=%7B"name"%3A"bob"%2C"age"%3A23%7D
```

If the path is not a valid route, or any of the route params or search params are missing or of the wrong type, it will throw a type error.

## Hooks

`next-typesafe-url` exports a `useRouteParams` and `useSearchParams` hook that will return the route params / search params for the current route. They take one argument, the zod schema for either route params or search params from the Route object.

```tsx
const params = useSearchParams(Route.searchParams);
const { data, isReady, isError, error } = params;
```

`isReady` is the internal state of next/router, and `isError` is a boolean that is true if the params do not match the schema. If `isError` is true, then `error` will be a zod error object you can use to get more information about the error. (_also check out [zod-validation-error](https://github.com/causaly/zod-validation-error) to get a nice error message_)

**If `isReady` is true and `isError` is false, then `data` will always be valid and match the schema.**

## Reccomended Usage

**It is reccomended to only call `useSearchParams` and `useRouteParams` in the top level component of each route, and pass the data down to child components through props or context.**

If you are looking for a easier way to do globally this check out [Jotai](https://jotai.org/).

```tsx
import { atom, useSetAtom, useAtomValue } from "jotai";

// In route file in pages directory

const productRouteParamsAtom = atom<z.infer<typeof Route.routeParams>>({
  productID: 1,
});

const Page: NextPage = () => {
  const setRouteParams = useSetAtom(productRouteParamsAtom);

  const params = useRouteParams(Route.routeParams);
  const { data, isError, isReady } = params;

  if (isReady && !isError) {
    setRouteParams(data);
  }

  return (
    <div>
      <DeeperComponent />
    </div>
  );
};
export default Page;

//anwhere in the tree

function DeeperComponent() {
  const routeParams = useAtomValue(productRouteParamsAtom);
  return <div>{routeParams.productID}</div>;
}
```

## AppRouter Type

`next-typesafe-url` exports a `AppRouter` type that you can use to get the type of the valid search params and route params for any given route in your app.

```tsx
import { AppRouter } from "next-typesafe-url";

type ProductIDRouteParams = AppRouter["/product/[productID]"]["routeParams"];
// type ProductIDRouteParams = {
//     productID: number;
// }
```

## Command Line Options

- `-w`: Watch for changes and automatically rebuild.

## License

[MIT](LICENSE)

# TODO

- fix ci
- add tests
