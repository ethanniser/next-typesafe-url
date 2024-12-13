import { z } from "zod";
import { type DynamicRoute } from "next-typesafe-url";

export const Route = {
  searchParams: z.object({
    foo: z.string(),
    bar: z.number(),
  }),
} satisfies DynamicRoute;

export type RouteType = typeof Route;
