// !!! huge credit to yesmeck https://github.com/yesmeck/remix-routes as well as Tanner Linsley https://tanstack.com/router/v1 for the inspiration for this

import { useRouter } from "next/router";
import { z } from "zod";
import { useState, useEffect, ReactElement } from "react";
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

import type { ParsedUrlQuery } from "querystring";
import React from "react";

export function parseServerSideSearchParams<T extends z.AnyZodObject>({
  query,
  validator,
}: {
  query: ParsedUrlQuery;
  validator: T;
}): ServerParseParamsResult<T> {
  if (!query) {
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
    Object.entries(query).map(([key, value]) => [key, parse3(value)])
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
  params,
  validator,
}: {
  params: ParsedUrlQuery | undefined;
  validator: T;
}): ServerParseParamsResult<T> {
  if (!params) {
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
    Object.entries(params).map(([key, value]) => [key, parse2(value)])
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
type SomeReactComponent = (...args: any[]) => ReactElement;

export function withParamValidation(
  Component: SomeReactComponent,
  validator: {
    searchParams: z.AnyZodObject | undefined;
    routeParams: z.AnyZodObject | undefined;
  }
): SomeReactComponent {
  const ValidatedPageComponent: SomeReactComponent = (props) => {
    const { params, searchParams } = props;

    let parsedRouteParams = undefined;

    if (validator.routeParams) {
      parsedRouteParams = parseServerSideRouteParams({
        params,
        validator: validator.routeParams,
      });
    }

    let parsedSearchParams = undefined;
    if (validator.searchParams) {
      parsedSearchParams = parseServerSideSearchParams({
        query: searchParams ?? {},
        validator: validator.searchParams,
      });
    }

    if (parsedRouteParams?.isError) {
      throw parsedRouteParams.error;
    } else if (parsedSearchParams?.isError) {
      throw parsedSearchParams.error;
    }

    return React.createElement(Component, {
      routeParams: parsedRouteParams?.data,
      searchParams: parsedSearchParams?.data,
    });
  };

  return ValidatedPageComponent;
}
