import type { StaticRouter, DynamicRouter } from "@@@next-typesafe-url";
import { z } from "zod";

type AppRouter = StaticRouter & DynamicRouter;

type RouterInputs = {
  [K in keyof AppRouter]: AppRouter[K]["input"];
};

type RouterOutputs = {
  [K in keyof AppRouter]: AppRouter[K]["output"];
};

type StaticRoutes = keyof StaticRouter;
type DynamicRoutes = keyof DynamicRouter;

type InferRoute<T extends DynamicRoute> = {
  input: HandleUndefined<HelperInput<T>>;
  output: HandleUndefined<HelperOutput<T>>;
};

type HasProperty<T, K extends string> = K extends keyof T ? true : false;

type HelperInput<T extends DynamicRoute> = {
  searchParams: HasProperty<T, "searchParams"> extends true
    ? z.input<T["searchParams"]>
    : undefined;
  routeParams: HasProperty<T, "routeParams"> extends true
    ? z.input<T["routeParams"]>
    : undefined;
};

type HelperOutput<T extends DynamicRoute> = {
  searchParams: HasProperty<T, "searchParams"> extends true
    ? z.output<T["searchParams"]>
    : undefined;
  routeParams: HasProperty<T, "routeParams"> extends true
    ? z.output<T["routeParams"]>
    : undefined;
};

type HandleUndefined<T extends DynamicRoute> =
  T["routeParams"] extends undefined
    ? T["searchParams"] extends undefined
      ? // Both are undefined
        Option4
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

type Option4 = {
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

type DynamicLayout = Required<Pick<DynamicRoute, "routeParams">>;

type InferLayoutPropsType<T extends DynamicLayout, K extends string = never> = {
  routeParams: z.output<T["routeParams"]>;
  children: React.ReactNode;
} & { [P in K]: React.ReactNode };

type PathOptions<T extends AllRoutes> = T extends StaticRoutes
  ? StaticPathOptions<T>
  : { route: T } & RouterInputs[T];

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
      data: undefined;
      isLoading: true;
      isError: false;
      error: undefined;
    }
  | {
      data: z.output<T>;
      isError: false;
      isLoading: false;
      error: undefined;
    }
  | {
      data: undefined;
      isLoading: false;
      isError: true;
      error: z.ZodError;
    };

type ServerParseParamsResult<T extends z.AnyZodObject> =
  | {
      data: z.output<T>;
      isError: false;
      error: undefined;
    }
  | {
      data: undefined;
      isError: true;
      error: z.ZodError;
    };

type InferPagePropsType<T extends DynamicRoute> = {
  searchParams: T["searchParams"] extends z.AnyZodObject
    ? z.output<T["searchParams"]>
    : undefined;
  routeParams: T["routeParams"] extends z.AnyZodObject
    ? z.output<T["routeParams"]>
    : undefined;
};

export {
  // shared types
  RouterInputs,
  RouterOutputs,
  AllRoutes,
  DynamicRoute,

  // used by generated file
  StaticRoute,
  PathOptions,
  InferRoute,
  ServerParseParamsResult,
  UseParamsResult,

  //app only types
  DynamicLayout,
  InferPagePropsType,
  InferLayoutPropsType,
};
