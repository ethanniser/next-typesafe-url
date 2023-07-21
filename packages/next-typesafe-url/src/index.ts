// !!! huge credit to yesmeck https://github.com/yesmeck/remix-routes as well as Tanner Linsley https://tanstack.com/router/v1 for the inspiration for this
import {
  generateParamStringFromSearchParamObj,
  encodeAndFillRoute,
} from "./utils";
import type {
  AllRoutes,
  PathOptions,
  RouterInputs,
  RouterOutputs,
  InferRoute,
  DynamicRoute,
  InferPagePropsType,
  InferLayoutPropsType,
  DynamicLayout,
  StaticRoute,
  UseParamsResult,
  ServerParseParamsResult,
} from "./types";

export type {
  AllRoutes,
  PathOptions,
  RouterInputs,
  RouterOutputs,
  InferRoute,
  DynamicRoute,
  InferPagePropsType,
  InferLayoutPropsType,
  DynamicLayout,
  StaticRoute,
  UseParamsResult,
  ServerParseParamsResult,
};

// * TESTED
/**
 * Serializes and encodes the passed search and route param objects and merges them with the route string.
 *
 * @example $path({ route: "/foo/[bar]", routeParams: { bar: "baz" } }) -> "/foo/baz"
 * @example $path({ route: "/foo", searchParams: { bar: "baz" } }) -> "/foo?bar=baz"
 * @example $path({ route: "/foo/[bar]", routeParams: { bar: "baz" }, searchParams: { lux: "flux" } }) -> "/foo/baz?lux=flux"
 */
export function $path<T extends AllRoutes>({
  route,
  searchParams,
  routeParams,
}: PathOptions<T>): string {
  if (searchParams && routeParams) {
    const searchString = generateParamStringFromSearchParamObj(searchParams);
    const routeString = encodeAndFillRoute(route, routeParams);

    return `${routeString}${searchString}`;
  } else if (routeParams && !searchParams) {
    const routeString = encodeAndFillRoute(route, routeParams);

    return routeString;
  } else if (searchParams && !routeParams) {
    const searchString = generateParamStringFromSearchParamObj(searchParams);

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- route is always a string
    return `${route}${searchString}`;
  } else {
    //both are undefined
    return route;
  }
}
