import { type RouteType as Route_0 } from "../../../examples/pagesdir/src/pages/[slug]/[...foo]";
import { type RouteType as Route_1 } from "../../../examples/pagesdir/src/pages/[slug]/server";
import { type InferRoute } from "next-typesafe-url";

declare module "@@@next-typesafe-url" {
  interface DynamicRouter {
    "/[slug]/[...foo]": InferRoute<Route_0>;
    "/[slug]/server": InferRoute<Route_1>;
  }

  interface StaticRouter {
    "/": StaticRoute;
  }
}
