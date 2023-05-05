// !!! huge credit to yesmeck https://github.com/yesmeck/remix-routes as well as Tanner Linsley https://tanstack.com/router/v1 for the inspiration for this

import { z } from "zod";
import {
  generateParamStringFromObject,
  fillPath,
  parse2,
  parse3,
} from "./utils";
import type {
  AllRoutes,
  PathOptions,
  ServerParseParamsResult,
  DynamicRoute,
} from "./types";
import { createElement } from "react";

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

import type { ParsedUrlQuery } from "querystring";

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

type NextAppPageProps = {
  params: Record<string, string>;
  searchParams: { [key: string]: string | string[] | undefined };
};
import type { ReactElement } from "react";
type SomeReactComponent = (...args: any[]) => ReactElement;

export function withParamValidation(
  Component: SomeReactComponent,
  validator: DynamicRoute
): SomeReactComponent {
  const ValidatedPageComponent: SomeReactComponent = (
    props: NextAppPageProps
  ) => {
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

    return createElement(Component, {
      routeParams: parsedRouteParams?.data,
      searchParams: parsedSearchParams?.data,
    });
  };

  return ValidatedPageComponent;
}
