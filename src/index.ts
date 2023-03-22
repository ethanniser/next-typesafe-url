// !!! huge credit to yesmeck https://github.com/yesmeck/remix-routes as well as Tanner Linsley https://tanstack.com/router/v1 for the inspiration for this

import { useRouter } from "next/router";
import { z } from "zod";
import { useState, useEffect } from "react";
import {
  parseObjectFromParamString,
  getDynamicRouteParams,
  generateParamStringFromObject,
  fillPath,
  parse2,
  parse3,
} from "./utils";
import type {
  AllRoutes,
  PathOptions,
  UseParamsResult,
  ServerParseParamsResult,
} from "./types";

export function $path<T extends AllRoutes>({
  route,
  searchParams,
  routeParams,
}: PathOptions<T>): string {
  if (searchParams && routeParams) {
    const searchString = generateParamStringFromObject(searchParams);
    const routeString = fillPath(route, routeParams);
    return `${routeString}${searchString}`;
  } else if (routeParams && !searchParams) {
    const routeString = fillPath(route, routeParams);
    return routeString;
  } else if (searchParams && !routeParams) {
    const searchString = generateParamStringFromObject(searchParams);
    return `${route}${searchString}`;
  } else {
    //both are undefined
    return route;
  }
}

// ! Should only be used in top level route component or a component that you know will only be rendered in a certain route
export function useRouteParams<T extends z.AnyZodObject>(
  validator: T
): UseParamsResult<T> {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<z.ZodError>(new z.ZodError([]));
  const [data, setData] = useState<z.infer<T> | undefined>(undefined);

  useEffect(() => {
    if (router.isReady) {
      setIsReady(true);
      const dynamicParams = getDynamicRouteParams(router.route, router.query);
      const validatedDynamicRouteParams = validator.safeParse(dynamicParams);
      if (validatedDynamicRouteParams.success) {
        setData(validatedDynamicRouteParams.data);
      } else {
        setIsError(true);
        setError(validatedDynamicRouteParams.error);
      }
    }
  }, [router, validator]);

  if (isError && isReady) {
    return {
      data: undefined,
      isValid: false,
      isReady: true,
      isError: true,
      error: error,
    };
  } else if (data !== undefined && isReady) {
    return {
      data: data,
      isValid: true,
      isReady: true,
      isError: false,
      error: undefined,
    };
  } else {
    return {
      data: undefined,
      isValid: false,
      isReady: false,
      isError: false,
      error: undefined,
    };
  }
}

// ! Should only be used in top level route component or a component that you know will only be rendered in a certain route
export function useSearchParams<T extends z.AnyZodObject>(
  searchValidator: T
): UseParamsResult<T> {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<z.ZodError>(new z.ZodError([]));
  const [data, setData] = useState<z.infer<T> | undefined>(undefined);

  useEffect(() => {
    if (router.isReady) {
      setIsReady(true);

      const queryString = router.asPath.split("?")[1] ?? "";
      const parsedSearchParams = parseObjectFromParamString(queryString);
      const validatedSearchParams =
        searchValidator.safeParse(parsedSearchParams);

      if (validatedSearchParams.success) {
        setData(validatedSearchParams.data);
      } else {
        setIsError(true);
        setError(validatedSearchParams.error);
      }
    }
  }, [router, searchValidator]);

  if (isError && isReady) {
    return {
      data: undefined,
      isValid: false,
      isReady: true,
      isError: true,
      error: error,
    };
  } else if (data !== undefined && isReady) {
    return {
      data: data,
      isValid: true,
      isReady: true,
      isError: false,
      error: undefined,
    };
  } else {
    return {
      data: undefined,
      isValid: false,
      isReady: false,
      isError: false,
      error: undefined,
    };
  }
}

import type { GetServerSidePropsContext } from "next";

export function parseServerSideSearchParams<T extends z.AnyZodObject>({
  context,
  validator,
}: {
  context: GetServerSidePropsContext;
  validator: T;
}): ServerParseParamsResult<T> {
  if (!context.query) {
    return {
      data: undefined,
      isError: true,
      error: new z.ZodError([
        {
          path: [],
          code: "custom",
          message: "No query context found",
        },
      ]),
    };
  }
  const parsedParams = Object.fromEntries(
    Object.entries(context.query).map(([key, value]) => [key, parse3(value)])
  );

  const validatedDynamicSearchParams = validator.safeParse(parsedParams);
  if (validatedDynamicSearchParams.success) {
    return {
      data: validatedDynamicSearchParams.data,
      isError: false,
      error: undefined,
    };
  } else {
    return {
      data: undefined,
      isError: true,
      error: validatedDynamicSearchParams.error as z.ZodError,
    };
  }
}

export function parseServerSideRouteParams<T extends z.AnyZodObject>({
  context,
  validator,
}: {
  context: GetServerSidePropsContext;
  validator: T;
}): ServerParseParamsResult<T> {
  if (!context.params) {
    return {
      data: undefined,
      isError: true,
      error: new z.ZodError([
        {
          path: [],
          code: "custom",
          message: "No param context found",
        },
      ]),
    };
  }

  const parsedParams = Object.fromEntries(
    Object.entries(context.params).map(([key, value]) => [key, parse2(value)])
  );

  const validatedDynamicRouteParams = validator.safeParse(parsedParams);
  if (validatedDynamicRouteParams.success) {
    return {
      data: validatedDynamicRouteParams.data,
      isError: false,
      error: undefined,
    };
  } else {
    return {
      data: undefined,
      isError: true,
      error: validatedDynamicRouteParams.error as z.ZodError,
    };
  }
}
