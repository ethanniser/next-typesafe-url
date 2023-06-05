import { type RouteType as Route_0 } from "../src/pages/[slug]/server"
import { type RouteType as Route_1 } from "../src/pages/[slug]/[...foo]"
import type { InferRoute, StaticRoute } from "next-typesafe-url";

declare module "@@@next-typesafe-url" {
  interface DynamicRouter {
    "/[slug]/server": InferRoute<Route_0>;
    "/[slug]/[...foo]": InferRoute<Route_1>;
  }

  interface StaticRouter {
    "/": StaticRoute;
  }
}
