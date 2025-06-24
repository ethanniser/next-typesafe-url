import type { StaticRouter, DynamicRouter } from "@@@next-typesafe-url";
import { z } from "zod";

// a total map of every route and its input and output types (if it has any)
type AppRouter = StaticRouter & DynamicRouter;

// extract only the input types from the router
type RouterInputs = {
  [K in keyof AppRouter]: AppRouter[K]["input"];
};

// extract only the output types from the router
type RouterOutputs = {
  [K in keyof AppRouter]: AppRouter[K]["output"];
};

// allof the static routes
type StaticRoutes = keyof StaticRouter;

// converts a DynamicRoute into its inferred input and output types
type InferRoute<T extends DynamicRoute> = {
  input: HandleUndefined<T, "input">;
  output: HandleUndefined<T, "output">;
};

// The HandleUndefined type handles each of the 4 possible cases:
// both are undefined, only routeParams is undefined,
// only searchParams is undefined, and neither are undefined

// For the options where the searchParams isnt undefined
// we use AllPossiblyUndefined to check if every property of the validator is undefined
// If so, we set the entire property to possibly undefined
// This is so you can leave the entire object undefined if you want to
// We don't do this for routeParams because it doesn't really make sense to have optional routeParams

type HandleUndefined<
  T extends DynamicRoute,
  Mode extends "input" | "output",
> = T["routeParams"] extends undefined
  ? T["searchParams"] extends undefined
    ? // Both are undefined
      Option4
    : // Only routeParams is undefined
      Option2<T, Mode>
  : T["searchParams"] extends undefined
    ? // Only searchParams is undefined
      Option3<T, Mode>
    : // Neither are undefined
      Option1<T, Mode>;

// Neither are undefined
type Option1<
  T extends DynamicRoute,
  Mode extends "input" | "output",
> = Mode extends "input"
  ? AllPossiblyUndefined<
      z.input<NonNullable<T["searchParams"]>>
    > extends undefined
    ? {
        searchParams?: z.input<NonNullable<T["searchParams"]>> | undefined;
        routeParams: z.input<NonNullable<T["routeParams"]>>;
      }
    : {
        searchParams: z.input<NonNullable<T["searchParams"]>>;
        routeParams: z.input<NonNullable<T["routeParams"]>>;
      }
  : AllPossiblyUndefined<
        z.output<NonNullable<T["searchParams"]>>
      > extends undefined
    ? {
        searchParams?: z.output<NonNullable<T["searchParams"]>> | undefined;
        routeParams: z.output<NonNullable<T["routeParams"]>>;
      }
    : {
        searchParams: z.output<NonNullable<T["searchParams"]>>;
        routeParams: z.output<NonNullable<T["routeParams"]>>;
      };

// Only routeParams is undefined
type Option2<
  T extends DynamicRoute,
  Mode extends "input" | "output",
> = Mode extends "input"
  ? AllPossiblyUndefined<
      z.input<NonNullable<T["searchParams"]>>
    > extends undefined
    ? {
        searchParams?: z.input<NonNullable<T["searchParams"]>> | undefined;
        routeParams?: undefined;
      }
    : {
        searchParams: z.input<NonNullable<T["searchParams"]>>;
        routeParams?: undefined;
      }
  : AllPossiblyUndefined<
        z.output<NonNullable<T["searchParams"]>>
      > extends undefined
    ? {
        searchParams?: z.output<NonNullable<T["searchParams"]>> | undefined;
        routeParams?: undefined;
      }
    : {
        searchParams: z.output<NonNullable<T["searchParams"]>>;
        routeParams?: undefined;
      };

// Only searchParams is undefined
type Option3<
  T extends DynamicRoute,
  Mode extends "input" | "output",
> = Mode extends "input"
  ? {
      searchParams?: undefined;
      routeParams: z.input<NonNullable<T["routeParams"]>>;
    }
  : {
      searchParams?: undefined;
      routeParams: z.output<NonNullable<T["routeParams"]>>;
    };

// Both are undefined
type Option4 = {
  searchParams?: undefined;
  routeParams?: undefined;
};

// Represents a route that has no dynamic parameters
type StaticRoute = {
  searchParams: undefined;
  routeParams: undefined;
};

// Represents a route that has dynamic parameters
type DynamicRoute = {
  searchParams?: z.AnyZodObject;
  routeParams?: z.AnyZodObject;
};

// basically just an object with a routeParams property that has a zod validator
type DynamicLayout = Required<Pick<DynamicRoute, "routeParams">>;

// sets the props for a layout based of the Route Object
// routeParams is the output of the routeParams validator
// K represents a optional union of keys that can be passed to this type that
// represents any parallel routes beneath the layout
type InferLayoutPropsType<T extends DynamicLayout, K extends string = never> = {
  routeParams: Promise<z.output<T["routeParams"]>>;
  children: React.ReactNode;
} & { [P in K]: React.ReactNode };

// the input type for $path
// if a route is static, it only needs the route property
// if a route is dynamic, it needs the route property and the input types for the route
type PathOptions<T extends AllRoutes> = T extends StaticRoutes
  ? StaticPathOptions<T>
  : { route: T } & RouterInputs[T];

// checks if all properties of T are undefined
type AllPossiblyUndefined<T> =
  Exclude<Partial<T>, undefined> extends T ? undefined : T;

// just the route, with the other properties set to optional and undefined
type StaticPathOptions<T extends StaticRoutes> = {
  route: T;
  searchParams?: undefined;
  routeParams?: undefined;
};

// represents every route in the app
type AllRoutes = keyof AppRouter;

// a discriminated  union representing the return states of use*Params
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

// a discriminated  union representing the return states of parseServerSideParams
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

// infers the props for a validated page component
// infers the output types from the Route object
type InferPagePropsType<T extends DynamicRoute> = {
  searchParams: T["searchParams"] extends z.AnyZodObject
    ? Promise<z.output<T["searchParams"]>>
    : undefined;
  routeParams: T["routeParams"] extends z.AnyZodObject
    ? Promise<z.output<T["routeParams"]>>
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
