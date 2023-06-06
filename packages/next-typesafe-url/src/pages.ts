// !!! huge credit to yesmeck https://github.com/yesmeck/remix-routes as well as Tanner Linsley https://tanstack.com/router/v1 for the inspiration for this

import { useRouter } from "next/router";
import { z } from "zod";
import { useState, useEffect } from "react";
import { parseObjectFromParamString, getDynamicRouteParams } from "./utils";
import type { UseParamsResult } from "./types";

export {
  parseServerSideRouteParams,
  parseServerSideSearchParams,
} from "./utils";

// ! Should ideally only be used in top level route component
export function useRouteParams<T extends z.AnyZodObject>(
  validator: T
): UseParamsResult<T> {
  const router = useRouter();
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<z.ZodError>(new z.ZodError([]));
  const [data, setData] = useState<z.infer<T> | undefined>(undefined);

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
  const [data, setData] = useState<z.infer<T> | undefined>(undefined);

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
