import type { InferRoute } from "./types";

export type DynamicRouter = {
  "/[productID]": InferRoute<__FOR_BUNDLER_MOCK_IMPORT>;
};

export type StaticRouter = {
  "/": StaticRoute;
};

type __FOR_BUNDLER_MOCK_IMPORT = {
  routeParams: z.ZodObject<
    {
      productID: z.ZodNumber;
    },
    "strip",
    z.ZodTypeAny,
    {
      productID: number;
    },
    {
      productID: number;
    }
  >;
  searchParams: z.ZodObject<
    {
      location: z.ZodOptional<z.ZodEnum<["us", "eu"]>>;
    },
    "strip",
    z.ZodTypeAny,
    {
      location?: "us" | "eu" | undefined;
    },
    {
      location?: "us" | "eu" | undefined;
    }
  >;
};
