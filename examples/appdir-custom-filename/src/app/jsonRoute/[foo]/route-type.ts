import { z } from "zod";
import { type DynamicRoute } from "next-typesafe-url";

export const Route = {
  routeParams: z.object({
    // foo: z.literal("undefined"),
    foo: z.object({ foo: z.string() }),
  }),
} satisfies DynamicRoute;

export type RouteType = typeof Route;
