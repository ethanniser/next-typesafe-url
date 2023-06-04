import { z } from "zod";
import { InferRoute } from "./static-types";

declare module "@@@next-typesafe-url" {
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

  interface DynamicRouter {
    "/__DEFAULT": InferRoute<__FOR_BUNDLER_MOCK_IMPORT>;
  };

  interface StaticRouter {
    "/__DEFAULT2": StaticRoute;
  };
}
