---
title: "Search/Route Params- Pages"
description: "how to consume params in pages via next-typesafe-url"
nextPage:
  text: "Next: API Reference"
  link: "en/api-reference"
---

## Versions

While the apis for `app` and `pages` are very similar, there are some important differences.

<h4>Make sure you follow the docs for your use case</h4>

### This page: `pages` version

View the `app` version [here](search-route-params-app)

## Hooks

`next-typesafe-url/pages` exports a `useRouteParams` and `useSearchParams` hook that will return the route params / search params for the current route. They take one argument, the zod schema for either route params or search params from the Route object.

```tsx
import { useSearchParams, useRouteParams } from "next-typesafe-url/pages";

export default function Component() {
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

### Errors

`isLoading` is the loading state of the internal Next router, and `isError` is a boolean that is true if the params do not match the schema. If `isError` is true, then `error` will be a `ZodError` object you can use to get more information about the error. (_also check out [zod-validation-error](https://github.com/causaly/zod-validation-error) to get a nice error message_)

**If `isLoading` is false and `isError` is false, then `data` will always be valid and match the schema.**

### IMPORT WARNING

`next-typesafe-url/app` **ALSO** exports a `useRouteParams` and `useSearchParams` hook, but these are **NOT** the same as the hooks exported from `next-typesafe-url/pages`.

<h4>MAKE SURE YOU IMPORT FROM THE RIGHT PATH</h4>

## Recommended Usage

As I mentioned earlier, it is important that only the `RouteType`, not the `Route` is exported to not break hot reloading.

This means you should only call `useSearchParams` and `useRouteParams` in the top level component of each route, and pass the data down to child components through props or context.

Feel free to use your state management library of choice to pass the data down to child components.

## getStatic/SeverSide Props

`next-typesafe-url` provides full support for validating route params and search params in `getStaticProps` and `getServerSideProps`.

The `parseServerSideParams` function is used to parse the route params and search params on the server. They take the same schema from your `Route` object as the `useRouteParams` and `useSearchParams` hooks, as well as parts of `context` object from `getStaticProps` / `getServerSideProps`.

### Route Params

To parse route params, pass the `params` field from the gssp context object, as well as the route params schema from your `Route` object. Note this field is possibly undefined, so you should check for that before passing it to `parseServerSideParams`.

### Search Params

To parse search params, pass the `query` field from the gssp context object, as well as the search params schema from your `Route` object.

### Errors

Like the hooks, `parseServerSideParams` have an `isError` flag, and if it is true, then `error` will be a `ZodError` you can use to get more information about the error.

---

This is an example of how to use `next-typesafe-url` with `getServerSideProps`, but the same pattern can be used with `getStaticProps`.

**_In this example I simply pass all of the params as props, but you can use the fully typed and validated `data` you get back from `parseServerSideParams` however you wish._**

```tsx
// pages/product/[productID].tsx

import type {
  InferGetServerSidePropsType,
  NextPage,
  GetServerSideProps,
} from "next";
import { z } from "zod";
import { type AppRouter } from "next-typesafe-url";
import { parseServerSideParams } from "next-typesafe-url/pages";

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

type ServerSideProps = AppRouter["/product/[productID]"]["searchParams"] &
  AppRouter["/product/[productID]"]["routeParams"];

export const getServerSideProps: GetServerSideProps<ServerSideProps> = async (
  context
) => {
  const routeParams = parseServerSideParams({
    params: context.params ?? {},
    validator: Route.routeParams,
  });

  const searchParams = parseServerSideParams({
    params: context.query,
    validator: Route.searchParams,
  });

  if (routeParams.isError || searchParams.isError) {
    console.log(routeParams.error?.message, searchParams.error?.message);
    throw new Error("Invalid route or search params");
  } else {
    return {
      props: {
        routeParams: routeParams.data,
        searchParams: searchParams.data,
      },
    };
  }
};

type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const Page: NextPage<PageProps> = ({ searchParams, routeParams }) => {
  return (
    <>
      <div>productID: {routeParams.productID}</div>
      <div>
        user: {`${searchParams.userInfo.name} - ${searchParams.userInfo.age}`}
      </div>
      <div>location: {searchParams.location}</div>
    </>
  );
};
export default Page;
```

<h4 class="idk-why">Finally, explore the full API reference</h4>
<style>
  .idk-why {
    margin-bottom: 40px;
  }
</style>
