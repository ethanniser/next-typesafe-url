import { z } from "zod";
import { type DynamicRoute } from "next-typesafe-url";

export const Route = {
  searchParams: z.object({
    foo: z
      .number()
      .transform((val) => `${val}`)
      .optional(),
  }),
} satisfies DynamicRoute;

export type RouteType = typeof Route;
