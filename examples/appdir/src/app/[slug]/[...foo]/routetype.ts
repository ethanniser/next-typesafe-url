import { z } from "zod";

export const Route = {
  routeParams: z.object({
    slug: z.string(),
    foo: z.array(z.number()),
  }),
  searchParams: z.object({
    location: z.enum(["us", "eu"]).optional(),
    userInfo: z.object({
      name: z.string(),
      age: z.number(),
    }),
  }),
};
