// !!! huge credit to yesmeck https://github.com/yesmeck/remix-routes as well as Tanner Linsley https://tanstack.com/router/v1 for the inspiration for this
import { generateSearchParamStringFromObj, encodeAndFillRoute } from "./utils";
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
 * @throws If a dynamic segment or catch-all segment in the route does not have a corresponding value in routeParams.
 * @throws If any of the passed values are not a non-empty string, number, boolean, array, object, or null.
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
    const searchString = generateSearchParamStringFromObj(searchParams);
    const routeString = encodeAndFillRoute(route, routeParams);

    return `${routeString}${searchString}`;
  } else if (routeParams && !searchParams) {
    const routeString = encodeAndFillRoute(route, routeParams);

    return routeString;
  } else if (searchParams && !routeParams) {
    const searchString = generateSearchParamStringFromObj(searchParams);

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- route is always a string
    return `${route}${searchString}`;
  } else {
    //both are undefined
    return route;
  }
}
