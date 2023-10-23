import { z } from "zod";
import { type DynamicRoute } from "next-typesafe-url";

const COUNTRIES = ["NL", "UK", "US", "DE", "FR"] as const;

export const Route = {
  searchParams: z.object({
    countries: z.array(z.enum(COUNTRIES)).optional(),
  }),
  options: {
    format: {
      arrayFormatSeparator: "~",
    },
  },
} satisfies DynamicRoute;

export type RouteType = typeof Route;
