import { type z } from "zod";

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

type DynamicRouter = {
  "/__DEFAULT": InferRoute<__FOR_BUNDLER_MOCK_IMPORT>;
};

type StaticRouter = {
  "/__DEFAULT2": StaticRoute;
};

type AppRouter = StaticRouter & DynamicRouter;

type StaticRoutes = keyof StaticRouter;
type DynamicRoutes = keyof DynamicRouter;

type InferRoute<T extends DynamicRoute> = HandleUndefined<Helper<T>>;

type Helper<T extends DynamicRoute> = {
  searchParams: T["searchParams"] extends undefined
    ? undefined
    : z.infer<T["searchParams"]>;
  routeParams: T["routeParams"] extends undefined
    ? undefined
    : z.infer<T["routeParams"]>;
};

type HandleUndefined<T extends DynamicRoute> =
  T["routeParams"] extends undefined
    ? T["searchParams"] extends undefined
      ? // Both are undefined
        Option4<T>
      : // Only routeParams is undefined
        Option2<T>
    : T["searchParams"] extends undefined
    ? // Only searchParams is undefined
      Option3<T>
    : // Neither are undefined
      Option1<T>;

type Option1<T extends DynamicRoute> = AllPossiblyUndefined<
  T["searchParams"]
> extends undefined
  ? {
      searchParams?: T["searchParams"] | undefined;
      routeParams: T["routeParams"];
    }
  : {
      searchParams: T["searchParams"];
      routeParams: T["routeParams"];
    };

type Option2<T extends DynamicRoute> = AllPossiblyUndefined<
  T["searchParams"]
> extends undefined
  ? {
      searchParams?: T["searchParams"] | undefined;
      routeParams?: undefined;
    }
  : {
      searchParams: T["searchParams"];
      routeParams?: undefined;
    };

type Option3<T extends DynamicRoutes> = {
  searchParams?: undefined;
  routeParams: T["routeParams"];
};

type Option4<T extends DynamicRoutes> = {
  searchParams?: undefined;
  routeParams?: undefined;
};

type StaticRoute = {
  searchParams: undefined;
  routeParams: undefined;
};

type DynamicRoute = {
  searchParams?: z.AnyZodObject;
  routeParams?: z.AnyZodObject;
};

type PathOptions<T extends AllRoutes> = T extends StaticRoutes
  ? StaticPathOptions<T>
  : { route: T } & AppRouter[T];

type AllPossiblyUndefined<T> = Exclude<Partial<T>, undefined> extends T
  ? undefined
  : T;

type StaticPathOptions<T extends StaticRoutes> = {
  route: T;
  searchParams?: undefined;
  routeParams?: undefined;
};

type AllRoutes = keyof AppRouter;

type UseParamsResult<T extends z.AnyZodObject> =
  | {
      data: z.infer<T>;
      isValid: true;
      isReady: true;
      isError: false;
      error: undefined;
    }
  | {
      data: undefined;
      isValid: false;
      isReady: true;
      isError: true;
      error: z.ZodError<T>;
    }
  | {
      data: undefined;
      isValid: false;
      isReady: false;
      isError: false;
      error: undefined;
    };

type ServerParseParamsResult<T extends z.AnyZodObject> =
  | {
      data: z.infer<T>;
      isError: false;
      error: undefined;
    }
  | {
      data: undefined;
      isError: true;
      error: z.ZodError<T>;
    };

type InferPagePropsType<T extends DynamicRoute> = {
  searchParams: T["searchParams"] extends z.AnyZodObject
    ? z.infer<T["searchParams"]>
    : undefined;
  routeParams: T["routeParams"] extends z.AnyZodObject
    ? z.infer<T["routeParams"]>
    : undefined;
};

export {
  AppRouter,
  ServerParseParamsResult,
  UseParamsResult,
  AllRoutes,
  PathOptions,
  InferPagePropsType,
  DynamicRoute,
  InferRoute,
};
