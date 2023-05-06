import { z } from "zod";

export const Route = {
  searchParams: z.object({
    location: z.string().optional(),
  }),
  routeParams: undefined,
};
