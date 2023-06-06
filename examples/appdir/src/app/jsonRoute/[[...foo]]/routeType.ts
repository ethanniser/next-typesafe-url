import { z } from "zod";
import { type DynamicRoute } from "next-typesafe-url";

export const Route = {
  routeParams: z.object({
    foo: z.tuple([z.string(), z.object({ bar: z.string() })]).optional(),
  }),
} satisfies DynamicRoute;

export type RouteType = typeof Route;
