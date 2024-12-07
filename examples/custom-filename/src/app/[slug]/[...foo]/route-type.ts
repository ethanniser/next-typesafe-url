import { z } from "zod";
import { type DynamicRoute } from "next-typesafe-url";

export const Route = {
  routeParams: z.object({
    slug: z.string(),
    foo: z.array(z.number()).or(z.number()),
  }),
  searchParams: z.object({
    location: z.enum(["us", "eu"]).optional(),
    userInfo: z
      .object({
        name: z.string(),
        age: z.number(),
      })
      .optional(),
  }),
} satisfies DynamicRoute;

export type RouteType = typeof Route;
