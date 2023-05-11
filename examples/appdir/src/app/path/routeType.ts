import { z } from "zod";
import { type DynamicRoute } from "next-typesafe-url";

export const Route = {
  searchParams: z.object({
    location: z.string().optional(),
  }),
} satisfies DynamicRoute;
