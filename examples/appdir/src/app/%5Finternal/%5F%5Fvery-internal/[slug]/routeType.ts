import { z } from "zod";
import { type DynamicRoute } from "next-typesafe-url";

export const Route = {
  routeParams: z.object({
    slug: z.string(),
  }),
} satisfies DynamicRoute;

export type RouteType = typeof Route;
