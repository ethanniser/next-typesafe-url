import { z } from "zod";
import { type DynamicRoute } from "next-typesafe-url";

export const Route = {
  routeParams: z.object({
    id: z.number(),
  }),
} satisfies DynamicRoute;

export type RouteType = typeof Route;
