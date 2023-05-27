// !!! huge credit to yesmeck https://github.com/yesmeck/remix-routes as well as Tanner Linsley https://tanstack.com/router/v1 for the inspiration for this

import { generateParamStringFromObject, fillPath } from "./utils";
import type {
  AllRoutes,
  PathOptions,
  AppRouter as AR,
  DynamicRoute as DR,
} from "./types";

export type AppRouter = AR;
export type DynamicRoute = DR;

export function $path<T extends AllRoutes>({
  route,
  searchParams,
  routeParams,
}: PathOptions<T>): string {
  if (searchParams && routeParams) {
    const searchString = generateParamStringFromObject(searchParams);
    const routeString = fillPath(route, routeParams);
    return `${routeString}${searchString}`;
  } else if (routeParams && !searchParams) {
    const routeString = fillPath(route, routeParams);
    return routeString;
  } else if (searchParams && !routeParams) {
    const searchString = generateParamStringFromObject(searchParams);
    return `${route}${searchString}`;
  } else {
    //both are undefined
    return route;
  }
}