// !!! huge credit to yesmeck https://github.com/yesmeck/remix-routes as well as Tanner Linsley https://tanstack.com/router/v1 for the inspiration for this

import { useRouter } from "next/router";
import { z } from "zod";
import { useState, useEffect } from "react";
import {
  parseObjectFromParamString,
  parseObjectFromStringRecord,
} from "./utils";
import type { UseParamsResult } from "./types";
export { parseServerSideParams } from "./utils";

/**
 * FOR PAGES DIRECTORY ONLY:
 * Parses the current dynamic route params and validates them against the provided zod schema.
 * Should only be used in the top level route component where your Route object is defined.
 * @param validator - The zod schema to validate the params against, should come from your Route object
 *
 * @example
 * const routeParams = useRouteParams(Route.routeParams);
 * const { data, isLoading, isError, error } = routeParams;
 */
export function useRouteParams<T extends z.AnyZodObject>(
  validator: T
): UseParamsResult<T> {
  const router = useRouter();
  const [isError, setIsError] = useState(false);
  // not used if theres no error, but we need to initialize it so just use a dummy error
  const [error, setError] = useState<z.ZodError>(new z.ZodError([]));
  const [data, setData] = useState<z.output<T> | undefined>(undefined);

  useEffect(() => {
    // next router is not ready while loading, during which query is undefined
    // if so we do nothing
    if (router.isReady) {
      // parse the params to a Record<string, unknown>
      const dynamicParams = parseObjectFromStringRecord(router.query);
      // validate the params against the zod schema
      const validatedDynamicRouteParams = validator.safeParse(dynamicParams);
      // update state based on the validation result
      if (validatedDynamicRouteParams.success) {
        setData(validatedDynamicRouteParams.data);
      } else {
        setIsError(true);
        setError(validatedDynamicRouteParams.error);
      }
    }
    // rerun whenever the router or validator changes
  }, [router, validator]);

  if (isError) {
    // if there was an error, return the error
    return {
      data: undefined,
      isError: true,
      error: error,
      isLoading: false,
    };
  } else {
    if (!data) {
      // if there was no error but the data is undefined, we're still loading
      return {
        data: undefined,
        isError: false,
        isLoading: true,
        error: undefined,
      };
    } else {
      // if there was no error and the data is defined, return the data
      return {
        data: data,
        isError: false,
        isLoading: false,
        error: undefined,
      };
    }
  }
}

/**
 * FOR PAGES DIRECTORY ONLY:
 * Parses the current search params and validates them against the provided zod schema.
 * Should only be used in the top level route component where your Route object is defined.
 * @param validator - The zod schema to validate the params against, should come from your Route object
 *
 * @example
 * const searchParams = useSearchParams(Route.searchParams);
 * const { data, isLoading, isError, error } = searchParams;
 */
export function useSearchParams<T extends z.AnyZodObject>(
  searchValidator: T
): UseParamsResult<T> {
  const router = useRouter();
  const [isError, setIsError] = useState(false);
  // not used if theres no error, but we need to initialize it so just use a dummy error
  const [error, setError] = useState<z.ZodError>(new z.ZodError([]));
  const [data, setData] = useState<z.output<T> | undefined>(undefined);

  useEffect(() => {
    // next router is not ready while loading, during which query is undefined
    // if so we do nothing
    if (router.isReady) {
      // get the search param query string from the router path
      const queryString = router.asPath.split("?")[1] ?? "";
      // parse the query string to a Record<string, unknown>
      const parsedSearchParams = parseObjectFromParamString(queryString);
      // validate the params against the zod schema
      const validatedSearchParams =
        searchValidator.safeParse(parsedSearchParams);

      // update state based on the validation result
      if (validatedSearchParams.success) {
        setData(validatedSearchParams.data);
      } else {
        setIsError(true);
        setError(validatedSearchParams.error);
      }
    }
    // rerun whenever the router or validator changes
  }, [router, searchValidator]);

  if (isError) {
    // if there was an error, return the error
    return {
      data: undefined,
      isError: true,
      error: error,
      isLoading: false,
    };
  } else {
    if (!data) {
      // if there was no error but the data is undefined, we're still loading
      return {
        data: undefined,
        isError: false,
        isLoading: true,
        error: undefined,
      };
    } else {
      // if there was no error and the data is defined, return the data
      return {
        data: data,
        isError: false,
        isLoading: false,
        error: undefined,
      };
    }
  }
}
