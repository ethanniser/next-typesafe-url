// !!! huge credit to yesmeck https://github.com/yesmeck/remix-routes as well as Tanner Linsley https://tanstack.com/router/v1 for the inspiration for this

import {
  getDynamicRouteParams,
  parseObjectFromParamString,
  parseServerSideRouteParams,
  parseServerSideSearchParams,
} from "./utils";
import type {
  DynamicRoute,
  InferPagePropsType as IPPT,
  UseAppParamsResult,
  UseParamsResult,
} from "./types";
import { createElement } from "react";

export type InferPagePropsType<T extends DynamicRoute> = IPPT<T>;

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

import {
  useParams,
  useSearchParams as useNextSearchParams,
  usePathname,
} from "next/navigation";
import { useState, useEffect } from "react";
import { z } from "zod";
import { parseObjectFromURLParamObj, parseObjectFromParamObj } from "./utils";

export function useRouteParams<T extends z.AnyZodObject>(
  validator: T
): UseAppParamsResult<T> {
  const params = useParams();
  console.log(params);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<z.ZodError>(new z.ZodError([]));
  const [data, setData] = useState<z.infer<T> | undefined>(undefined);

  useEffect(() => {
    const parsedSearchParams = parseObjectFromParamObj(params);
    console.log(parsedSearchParams);
    const validatedSearchParams = validator.safeParse(parsedSearchParams);

    if (validatedSearchParams.success) {
      console.log(validatedSearchParams.data);
      setData(validatedSearchParams.data);
    } else {
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
      console.log(validatedSearchParams.data);
      setData(validatedSearchParams.data);
    } else {
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
