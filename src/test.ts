import { z } from "zod";
import { $path } from ".";

const Route = {
  searchParams: z.object({
    name: z.string().optional(),
  }),
  routeParams: z.object({
    slug: z.number(),
  }),
};
export type RouteType = typeof Route;
