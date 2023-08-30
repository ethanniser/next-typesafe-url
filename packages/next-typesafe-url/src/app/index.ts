// !!! huge credit to yesmeck https://github.com/yesmeck/remix-routes as well as Tanner Linsley https://tanstack.com/router/v1 for the inspiration for this

import type { UseParamsResult } from "../types";
import { useRef } from "react";
import {
  useParams,
  useSearchParams as useNextSearchParams,
} from "next/navigation";
import { useState, useEffect } from "react";
import { type Schema, ValidationIssue, Infer, validate } from "@decs/typeschema";
import {
  parseObjectFromReadonlyURLParams,
  parseObjectFromStringRecord,
} from "../utils";

function usePrevious<T>(value: T) {
  const ref = useRef<T>();
  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes
  // Return previous value (happens before update in useEffect above)
  return ref.current;
}

/**
 * FOR APP DIRECTORY ONLY:
 * Parses the current dynamic route params
 * and validates them against the provided zod schema from your `Route` object.
 * Be careful if using this in a component that is used in multiple routes,
 * making sure you pass the correct validator for the current route.
 * @param validator - The zod schema to validate the params against, should come from your `Route` object
 *
 * @example
 * const routeParams = useRouteParams(Route.routeParams);
 * const { data, isLoading, isError, error } = routeParams;
 */
export function useRouteParams<T extends Schema>(
  validator: T
): UseParamsResult<T> {
  const params = useParams();
  const prev = usePrevious(params);
  // to prevent infinite rerenders, we need to deep compare between renders
  const same = JSON.stringify(prev) === JSON.stringify(params);
  const [isError, setIsError] = useState(false);
  // not used if theres no error, but we need to initialize it so just use a dummy error
  const [error, setError] = useState<ValidationIssue[]>([]);
  const [data, setData] = useState<Infer<T> | undefined>(undefined);

  useEffect(() => {
    // parse the params to a Record<string, unknown>
    const parsedRouteParams = parseObjectFromStringRecord(params);
    // validate the params against the schema
    validate(validator, parsedRouteParams).then((result) => {
      // update the state based on the validation result  
      if (result.success) {
          setData(result.data);
          setIsError(false);
          setError([]);
        } else {
          setData(undefined);
          setIsError(true);
          setError(result.issues);
        }
      }).catch(() => {
        setData(undefined);
        setIsError(true);
        setError([{message: "validation promise rejected, source of error unknown"}]);
      })
    // only rerun if the params have changed between renders
  }, [same]);

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
 * FOR APP DIRECTORY ONLY:
 * Parses the current search params
 * and validates them against the provided zod schema from your `Route` object.
 * Be careful if using this in a component that is used in multiple routes,
 * making sure you pass the correct validator for the current route.
 * @param validator - The zod schema to validate the params against, should come from your `Route` object
 *
 * @example
 * const searchParams = useSearchParams(Route.searchParams);
 * const { data, isLoading, isError, error } = searchParams;
 */
export function useSearchParams<T extends Schema>(
  searchValidator: T
): UseParamsResult<T> {
  const params = useNextSearchParams();
  const [isError, setIsError] = useState(false);
  // not used if theres no error, but we need to initialize it so just use a dummy error
  const [error, setError] = useState<ValidationIssue[]>([]);
  const [data, setData] = useState<Infer<T> | undefined>(undefined);

  useEffect(() => {
    // parse the params to a Record<string, unknown>
    const parsedSearchParams = parseObjectFromReadonlyURLParams(params);
    // validate the params against the schema
    validate(searchValidator, parsedSearchParams).then((result) => {
      // update the state based on the validation result  
      if (result.success) {
          setData(result.data);
          setIsError(false);
          setError([]);
        } else {
          setData(undefined);
          setIsError(true);
          setError(result.issues);
        }
      }).catch(() => {
        setData(undefined);
        setIsError(true);
        setError([{message: "validation promise rejected, source of error unknown"}]);
      })
  }, [params]);

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
