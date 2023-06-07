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

### `AppRouter`

```ts
type __Routes = "/" | "/foo"; // ... all of the routes in your app
type AppRouter = Record<__Routes, DynamicRoute | StaticRoute>;
```

Usage:

```ts
type FooSearchParams = AppRouter["/foo"]["searchParams"];
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
type PathOptions<T extends AllRoutes> = { route: T } & AppRouter[T];
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

Provides the search params for the current route. Uses `useSearchParams` from `next/navigation` under the hood.

```ts
declare function useSearchParams<T extends z.AnyZodObject>(
  searchValidator: T
): UseParamsResult<T>;
```

### `useRouteParams`

Provides the route params for the current route. Uses `useParams` from `next/navigation` under the hood.

```ts
declare function useRouteParams<T extends z.AnyZodObject>(
  validator: T
): UseParamsResult<T>;
```

### `SomeReactComponent`

For HOC to type input and output components.

```ts
type SomeReactComponent = (...args: any) => JSX.Element | Promise<JSX.Element>;
```

### `withParamValidation`

Wraps a `page.tsx` top level component and provides validation via the passed `DynamicRoute`.

```ts
declare function withParamValidation(
  Component: SomeReactComponent,
  validator: DynamicRoute
): SomeReactComponent;
```

### `withLayoutParamValidation`

Wraps a `layout.tsx` top level component and provides validation via the passed `DynamicLayout`.

```ts
declare function withLayoutParamValidation(
  Component: SomeReactComponent,
  validator: DynamicLayout
): SomeReactComponent;
```

## `next-typesafe-url/pages`

### `useSearchParams`

Provides the search params for the current route. Uses `useRouter` from `next/router` under the hood.

```ts
declare function useSearchParams<T extends z.AnyZodObject>(
  searchValidator: T
): UseParamsResult<T>;
```

### `useRouteParams`

Provides the route params for the current route. Uses `useRouter` from `next/router` under the hood.

```ts
declare function useRouteParams<T extends z.AnyZodObject>(
  validator: T
): UseParamsResult<T>;
```

### `parseServerSideSearchParams`

Takes `context.query` from `getServerSideProps` and validates it against the provided zod validator.

```ts
declare function parseServerSideSearchParams<T extends z.AnyZodObject>({
  query,
  validator,
}: {
  query: GetServerSidePropsContext["query"];
  validator: T;
}): ServerParseParamsResult<T>;
```

### `parseServerSideRouteParams`

Takes `context.params` from `getServerSideProps` and validates it against the provided zod validator.

```ts
declare function parseServerSideRouteParams<T extends z.AnyZodObject>({
  params,
  validator,
}: {
  params: GetServerSidePropsContext["params"];
  validator: T;
}): ServerParseParamsResult<T>;
```
