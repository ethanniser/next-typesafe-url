// !!! huge credit to yesmeck https://github.com/yesmeck/remix-routes as well as Tanner Linsley https://tanstack.com/router/v1 for the inspiration for this

import { useRouter } from "next/router";
import { z } from "zod";
import { useState, useEffect } from "react";
import {
  parseObjectFromParamString,
  getDynamicRouteParams,
  parseMapObject,
} from "./utils";
import type { UseParamsResult } from "./types";
import type { ServerParseParamsResult } from "./types";
import type { GetServerSidePropsContext } from "next";

// ! Should ideally only be used in top level route component
export function useRouteParams<T extends z.AnyZodObject>(
  validator: T
): UseParamsResult<T> {
  const router = useRouter();
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<z.ZodError>(new z.ZodError([]));
  const [data, setData] = useState<z.output<T> | undefined>(undefined);

  useEffect(() => {
    if (router.isReady) {
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

// ! Should ideally only be used in top level route component
export function useSearchParams<T extends z.AnyZodObject>(
  searchValidator: T
): UseParamsResult<T> {
  const router = useRouter();
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<z.ZodError>(new z.ZodError([]));
  const [data, setData] = useState<z.output<T> | undefined>(undefined);

  useEffect(() => {
    if (router.isReady) {
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

// takes gssp context.query
export function parseServerSideSearchParams<T extends z.AnyZodObject>({
  query,
  validator,
}: {
  query: GetServerSidePropsContext["query"];
  validator: T;
}): ServerParseParamsResult<T> {
  const parsedParams = parseMapObject(query);
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
      error: validatedDynamicSearchParams.error,
    };
  }
}

// takes gssp context.params
export function parseServerSideRouteParams<T extends z.AnyZodObject>({
  params,
  validator,
}: {
  params: GetServerSidePropsContext["params"];
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
          message: "Params field of gSSP context is undefined",
        },
      ]),
    };
  }

  const parsedParams = parseMapObject(params);
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
      error: validatedDynamicRouteParams.error,
    };
  }
}
