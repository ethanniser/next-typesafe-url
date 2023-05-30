// !!! huge credit to yesmeck https://github.com/yesmeck/remix-routes as well as Tanner Linsley https://tanstack.com/router/v1 for the inspiration for this

import {
  getDynamicRouteParams,
  parseObjectFromParamString,
  parseServerSideRouteParams,
  parseServerSideSearchParams,
} from "./utils";
import type {
  DynamicRoute,
  DynamicLayout,
  InferPagePropsType as IPPT,
  InferLayoutPropsType as ILPT,
  UseAppParamsResult,
  UseParamsResult,
} from "./types";
import { createElement, useRef } from "react";

export type { DynamicLayout };
export type InferPagePropsType<T extends DynamicRoute> = IPPT<T>;
export type InferLayoutPropsType<
  T extends DynamicLayout,
  K extends string = never
> = ILPT<T, K>;

type NextAppPageProps = {
  params: Record<string, string | string[]>;
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
    const { params, searchParams, ...otherProps } = props;

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
      ...otherProps,
    });
  };

  return ValidatedPageComponent;
}

export function withLayoutParamValidation(
  Component: SomeReactComponent,
  validator: DynamicLayout
): SomeReactComponent {
  const ValidatedPageComponent: SomeReactComponent = (
    props: Pick<NextAppPageProps, "params"> & { children: ReactElement }
  ) => {
    const { params, children, ...otherProps } = props;

    let parsedRouteParams = undefined;

    if (validator.routeParams) {
      parsedRouteParams = parseServerSideRouteParams({
        params,
        validator: validator.routeParams,
      });
    }

    if (parsedRouteParams?.isError) {
      throw parsedRouteParams.error;
    }

    console.log(parsedRouteParams?.data);

    return createElement(Component, {
      routeParams: parsedRouteParams?.data,
      children,
      ...otherProps,
    });
  };

  return ValidatedPageComponent;
}

import {
  useParams,
  useSearchParams as useNextSearchParams,
  usePathname,
} from "next/navigation";
import { useState, useEffect } from "react";
import { z } from "zod";
import { parseObjectFromURLParamObj, parseObjectFromParamObj } from "./utils";

function usePrevious<T>(value: T) {
  const ref = useRef<T>();
  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes
  // Return previous value (happens before update in useEffect above)
  return ref.current;
}

export function useRouteParams<T extends z.AnyZodObject>(
  validator: T
): UseAppParamsResult<T> {
  const params = useParams();
  const prev = usePrevious(params);
  const same = JSON.stringify(prev) === JSON.stringify(params);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<z.ZodError>(new z.ZodError([]));
  const [data, setData] = useState<z.infer<T> | undefined>(undefined);

  useEffect(() => {
    const parsedRouteParams = parseObjectFromParamObj(params);
    const validatedRouteParams = validator.safeParse(parsedRouteParams);

    if (validatedRouteParams.success) {
      setData(validatedRouteParams.data);
      setIsError(false);
    } else {
      setData(undefined);
      setIsError(true);
      setError(validatedRouteParams.error);
    }
  }, [same]);

  if (isError) {
    return {
      data: undefined,
      isError: true,
      error: error,
      isLoading: false,
    };
  } else {
    if (!data) {
      return {
        data: undefined,
        isError: false,
        isLoading: true,
        error: undefined,
      };
    } else {
      return {
        data: data,
        isError: false,
        isLoading: false,
        error: undefined,
      };
    }
  }
}

export function useSearchParams<T extends z.AnyZodObject>(
  searchValidator: T
): UseAppParamsResult<T> {
  const params = useNextSearchParams();
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<z.ZodError>(new z.ZodError([]));
  const [data, setData] = useState<z.infer<T> | undefined>(undefined);

  useEffect(() => {
    const parsedSearchParams = parseObjectFromURLParamObj(params);
    const validatedSearchParams = searchValidator.safeParse(parsedSearchParams);

    if (validatedSearchParams.success) {
      setData(validatedSearchParams.data);
      setIsError(false);
    } else {
      setData(undefined);
      setIsError(true);
      setError(validatedSearchParams.error);
    }
  }, [params]);

  if (isError) {
    return {
      data: undefined,
      isError: true,
      error: error,
      isLoading: false,
    };
  } else {
    if (!data) {
      return {
        data: undefined,
        isError: false,
        isLoading: true,
        error: undefined,
      };
    } else {
      return {
        data: data,
        isError: false,
        isLoading: false,
        error: undefined,
      };
    }
  }
}
