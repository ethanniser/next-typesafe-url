type DynamicRouter = {};

type StaticRouter = {};

type AppRouter = StaticRouter & DynamicRouter;

type StaticRoutes = keyof StaticRouter;
type DynamicRoutes = keyof DynamicRouter;

import { type z } from "zod";
import { type GetServerSidePropsContext } from "next";

type StaticRoute = {
  searchParams: undefined;
  routeParams: undefined;
};

type DynamicRoute = {
  searchParams: z.AnyZodObject | undefined;
  routeParams: z.AnyZodObject | undefined;
};

type InferRoute<T extends DynamicRoute> = {
  searchParams: HandleUndefined<T["searchParams"]>;
  routeParams: HandleUndefined<T["routeParams"]>;
};

export type PathOptions<T extends AllRoutes> = T extends StaticRoutes
  ? StaticPathOptions<T>
  : DynamicRouteOptions<T>;

type HandleUndefined<T extends z.AnyZodObject | undefined> =
  T extends z.AnyZodObject ? z.infer<T> : undefined;

type DynamicRouteOptions<T extends DynamicRoutes> =
  RouteParams<T> extends undefined
    ? SearchParams<T> extends undefined
      ? // Both are undefined
        Option4<T>
      : // Only routeParams is undefined
        Option2<T>
    : SearchParams<T> extends undefined
    ? // Only searchParams is undefined
      Option3<T>
    : // Neither are undefined
      Option1<T>;

type Option1<T extends DynamicRoutes> = {
  route: T;
  searchParams: SearchParams<T>;
  routeParams: RouteParams<T>;
};

type Option2<T extends DynamicRoutes> = {
  route: T;
  searchParams: SearchParams<T>;
  routeParams?: undefined;
};

type Option3<T extends DynamicRoutes> = {
  route: T;
  searchParams?: undefined;
  routeParams: RouteParams<T>;
};

type Option4<T extends DynamicRoutes> = {
  route: T;
  searchParams?: undefined;
  routeParams?: undefined;
};

type StaticPathOptions<T extends StaticRoutes> = {
  route: T;
  searchParams?: undefined;
  routeParams?: undefined;
};

export type InferServerSideParamsType<T extends DynamicRoute> = z.infer<
  T["routeParams"]
> &
  z.infer<T["searchParams"]>;

export type AllRoutes = keyof AppRouter;

type SearchParams<T extends AllRoutes> = AppRouter[T]["searchParams"];
type RouteParams<T extends AllRoutes> = AppRouter[T]["routeParams"];

declare function $path<T extends AllRoutes>({
  route,
  searchParams,
  routeParams,
}: PathOptions<T>): string;

declare function useRouteParams<T extends z.AnyZodObject>(
  validator: T
): UseParamsResult<T>;

declare function useSearchParams<T extends z.AnyZodObject>(
  searchValidator: T
): UseParamsResult<T>;

export type UseParamsResult<T extends z.AnyZodObject> =
  | {
      data: z.infer<T>;
      isValid: true;
      isReady: true;
      isError: false;
      error: undefined;
    }
  | {
      data: undefined;
      isValid: false;
      isReady: true;
      isError: true;
      error: z.ZodError<T>;
    }
  | {
      data: undefined;
      isValid: false;
      isReady: false;
      isError: false;
      error: undefined;
    };

export type ServerParseParamsResult<T extends z.AnyZodObject> =
  | {
      data: z.infer<T>;
      isError: false;
      error: undefined;
    }
  | {
      data: undefined;
      isError: true;
      error: z.ZodError<T>;
    };

export { $path, useRouteParams, useSearchParams };
