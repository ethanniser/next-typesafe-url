import { z } from "zod";
import { type DynamicRoute } from "next-typesafe-url";

export const Route = {
  routeParams: z.object({
    client: z.tuple([z.string(), z.number()]),
  }),
  searchParams: z.object({
    location: z.string().optional(),
  }),
} satisfies DynamicRoute;

export type RouteType = typeof Route;
