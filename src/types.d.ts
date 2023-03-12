type DynamicRouter = {};

type StaticRouter = {};

export type AppRouter = StaticRouter & DynamicRouter;

type StaticRoutes = keyof StaticRouter;
type DynamicRoutes = keyof DynamicRouter;

import { type z } from "zod";

type StaticRoute = {
  searchParams: undefined;
  routeParams: undefined;
};

type DynamicRoute = {
  searchParams: z.AnyZodObject;
  routeParams: z.AnyZodObject;
};

type InferRoute<T extends DynamicRoute> = {
  searchParams: z.infer<T["searchParams"]>;
  routeParams: z.infer<T["routeParams"]>;
};

export type PathOptions<T extends AllRoutes> = T extends StaticRoutes
  ? StaticPathOptions<T>
  : DynamicRouteOptions<T>;

type DynamicRouteOptions<T extends DynamicRoutes> = {
  path: T;
  searchParams: SearchParams<T>;
  routeParams: RouteParams<T>;
};

type StaticPathOptions<T extends StaticRoutes> = {
  path: T;
  searchParams?: undefined;
  routeParams?: undefined;
};

export type AllRoutes = keyof AppRouter;

type SearchParams<T extends AllRoutes> = AppRouter[T]["searchParams"];
type RouteParams<T extends AllRoutes> = AppRouter[T]["routeParams"];
