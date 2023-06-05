import { type RouteType as Route_0 } from "../../../examples/appdir/src/app/(test)/foo/[id]/nest/routeType";
import { type RouteType as Route_1 } from "../../../examples/appdir/src/app/(test)/foo/[id]/routeType";
import { type RouteType as Route_2 } from "../../../examples/appdir/src/app/[slug]/[...foo]/routeType";
import { type RouteType as Route_3 } from "../../../examples/appdir/src/app/client/[...client]/routeType";
import { type InferRoute } from "next-typesafe-url";

declare module "@@@next-typesafe-url" {
  interface DynamicRouter {
    "/foo/[id]/nest": InferRoute<Route_0>;
    "/foo/[id]": InferRoute<Route_1>;
    "/[slug]/[...foo]": InferRoute<Route_2>;
    "/client/[...client]": InferRoute<Route_3>;
  }

  interface StaticRouter {
    "/": StaticRoute;
  }
}
