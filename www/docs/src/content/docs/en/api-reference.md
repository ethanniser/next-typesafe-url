---
title: "API Reference"
description: "API Reference for next-typesafe-url"
---

## `next-typesafe-url`

### `DynamicRoute`

```ts
type DynamicRoute = {
  searchParams?: z.AnyZodObject;
  routeParams?: z.AnyZodObject;
};
```

### `DynamicLayout`

```ts
type DynamicLayout = {
  routeParams: z.AnyZodObject;
};
```

### `StaticRoute`

```ts
type StaticRoute = {
  searchParams: undefined;
  routeParams: undefined;
};
```

### `RouterInputs`

The input types of the zod schema for each of the routes in your app.

```ts
type __AllRoutes = "/" | "/foo"; // ... all of the routes in your app
type RouterInputs = Record<
  __AllRoutes,
  InferZodInput<DynamicRoute> | StaticRoute
>;
```

Usage:

```ts
type FooSearchParamsInput = RouterInputs["/foo"]["searchParams"];
```

### `RouterOutputs`

The outputtypes of the zod schema for each of the routes in your app.

```ts
type __AllRoutes = "/" | "/foo"; // ... all of the routes in your app
type RouterOutputs = Record<
  __AllRoutes,
  InferZodOutput<DynamicRoute> | StaticRoute
>;
```

Usage:

```ts
type FooSearchParams = RouterOutputs["/foo"]["searchParams"];
```

### `AllRoutes`

```ts
type AllRoutes = keyof AppRouter;
```

### `InferRoute`

Infers the types of the zod schemas inside `DynamicRoute`.

**Note:** If all of the keys in either schema are optional, the inferred type of the entire object will be optional.

```ts
type InferRoute<T extends DynamicRoute> = // complicated
```

Example:

```ts
const Route = {
  searchParams: z.object({
    location: z.string().optional(),
  }),
  routeParams: z.object({
    client: z.tuple([z.string(), z.number()]),
  }),
} satisfies DynamicRoute;

type InferredRouteType = InferRoute<typeof Route>;
type SameAs = {
  searchParams?:
    | {
        location?: string | undefined;
      }
    | undefined;
  routeParams: {
    client: [string, number];
  };
};
```

### `InferPagePropsType`

Infers the prop types for `page.tsx` top level components when wrapped with `withParamValidation`.

```ts
type InferPagePropsType<T extends DynamicRoute> = {
  searchParams: T["searchParams"] extends z.AnyZodObject
    ? z.infer<T["searchParams"]>
    : undefined;
  routeParams: T["routeParams"] extends z.AnyZodObject
    ? z.infer<T["routeParams"]>
    : undefined;
};
```

### `InferLayoutPropsType`

Infers the prop types for `layout.tsx` top level components when wrapped with `withLayoutParamValidation`.

```ts
type InferLayoutPropsType<T extends DynamicLayout, K extends string = never> = {
  routeParams: z.infer<T["routeParams"]>;
  children: React.ReactNode;
} & { [P in K]: React.ReactNode };
```

### `PathOptions`

Provides the input type for `$path` but could be useful for other things.

```ts
type PathOptions<T extends AllRoutes> = { route: T } & RouterInputs[T];
```

### `$path`

Generates a path string for a given route, route params, and search params.

```ts
declare function $path<T extends AllRoutes>({
  route,
  searchParams,
  routeParams,
}: PathOptions<T>): string;
```

### `useParamsResult`

Return type for all of the `use<Search/Route>Params` hooks.

```ts
type UseParamsResult<T extends z.AnyZodObject> =
  | {
      data: undefined;
      isLoading: true;
      isError: false;
      error: undefined;
    }
  | {
      data: z.infer<T>;
      isError: false;
      isLoading: false;
      error: undefined;
    }
  | {
      data: undefined;
      isLoading: false;
      isError: true;
      error: z.ZodError;
    };
```

### `ServerParseParamsResult`

Return type for all `parseServerSide<Search/Route>Params`.

```ts
type ServerParseParamsResult<T extends z.AnyZodObject> =
  | {
      data: z.infer<T>;
      isError: false;
      error: undefined;
    }
  | {
      data: undefined;
      isError: true;
      error: z.ZodError;
    };
```

## `next-typesafe-url/app`

### `useSearchParams`

Parses the current search params
and validates them against the provided zod schema from your `Route` object.
Be careful if using this in a component that is used in multiple routes,
making sure you pass the correct validator for the current route.

```ts
declare function useSearchParams<T extends z.AnyZodObject>(
  searchValidator: T
): UseParamsResult<T>;
```

### `useRouteParams`

Parses the current dynamic route params and validates them against the provided zod schema from your `Route` object.
Be careful if using this in a component that is used in multiple routes,
making sure you pass the correct validator for the current route.

```ts
declare function useRouteParams<T extends z.AnyZodObject>(
  validator: T
): UseParamsResult<T>;
```

## `next-typesafe-url/app/hoc`

### `SomeReactComponent`

The input type for the HOCs in this module. Represents any React component.

```ts
type SomeReactComponent = (...args: any) => JSX.Element | Promise<JSX.Element>;
```

### `withParamValidation`

A HOC that validates the params passed to a page component.
The component you wrap with this should use `InferPagePropsType` for its props.
It should be the default export of `page.tsx`.

```ts
declare function withParamValidation(
  Component: SomeReactComponent,
  validator: DynamicRoute
): SomeReactComponent;
```

### `withLayoutParamValidation`

A HOC that validates the route params passed to a layout component.
It should be the default export of `layout.tsx`.
The component you wrap with this should use `InferLayoutPropsType` for its props.

```ts
declare function withLayoutParamValidation(
  Component: SomeReactComponent,
  validator: DynamicLayout
): SomeReactComponent;
```

## `next-typesafe-url/pages`

### `useSearchParams`

Parses the current search params and validates them against the provided zod schema.
Should only be used in the top level route component where your `Route` object is defined.

```ts
declare function useSearchParams<T extends z.AnyZodObject>(
  searchValidator: T
): UseParamsResult<T>;
```

### `useRouteParams`

Parses the current dynamic route params and validates them against the provided zod schema.
Should only be used in the top level route component where your `Route` object is defined.

```ts
declare function useRouteParams<T extends z.AnyZodObject>(
  validator: T
): UseParamsResult<T>;
```

### `parseServerSideParams`

Takes an object of route params and a validator and returns a object of the validated route params.
If using with in pages gssp, pass context.params (for route params) or context.query (for search params) as the params argument.

```ts
declare function parseServerSideParams<T extends z.AnyZodObject>({
  params,
  validator,
}: {
  params: Record<string, string | string[] | undefined>;
  validator: T;
}): ServerParseParamsResult<T>;
```
