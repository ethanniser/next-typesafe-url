// !!! huge credit to yesmeck https://github.com/yesmeck/remix-routes as well as Tanner Linsley https://tanstack.com/router/v1 for the inspiration for this

import type {
  AllRoutes,
  RouterOutputs,
  UseParamsResult,
  DynamicRoute,
} from "../types";
import { useRef } from "react";
import {
  useParams,
  useSearchParams as useNextSearchParams,
} from "next/navigation";
import { useState, useEffect } from "react";
import { z } from "zod";
import {
  parseObjectFromReadonlyURLParams,
  parseObjectFromStringRecord,
  parseServerSideParams,
} from "../utils";
import { Metadata, ResolvingMetadata } from "next";

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
export function useRouteParams<T extends z.AnyZodObject>(
  validator: T
): UseParamsResult<T> {
  const params = useParams();
  const prev = usePrevious(params);
  // to prevent infinite rerenders, we need to deep compare between renders
  const same = JSON.stringify(prev) === JSON.stringify(params);
  const [isError, setIsError] = useState(false);
  // not used if theres no error, but we need to initialize it so just use a dummy error
  const [error, setError] = useState<z.ZodError>(new z.ZodError([]));
  const [data, setData] = useState<z.output<T> | undefined>(undefined);

  useEffect(() => {
    // parse the params to a Record<string, unknown>
    const parsedRouteParams = parseObjectFromStringRecord(params);
    // validate the params against the zod schema
    const validatedRouteParams = validator.safeParse(parsedRouteParams);

    // update state based on the validation result
    if (validatedRouteParams.success) {
      setData(validatedRouteParams.data);
      setIsError(false);
    } else {
      setData(undefined);
      setIsError(true);
      setError(validatedRouteParams.error);
    }
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
export function useSearchParams<T extends z.AnyZodObject>(
  searchValidator: T
): UseParamsResult<T> {
  const params = useNextSearchParams();
  const [isError, setIsError] = useState(false);
  // not used if theres no error, but we need to initialize it so just use a dummy error
  const [error, setError] = useState<z.ZodError>(new z.ZodError([]));
  const [data, setData] = useState<z.output<T> | undefined>(undefined);

  useEffect(() => {
    // parse the params to a Record<string, unknown>
    const parsedSearchParams = parseObjectFromReadonlyURLParams(params);
    // validate the params against the zod schema
    const validatedSearchParams = searchValidator.safeParse(parsedSearchParams);

    // update state based on the validation result
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

// for use with `generateMetadata`
type GenerateMetadataFunction = (
  props: {
    params: Record<string, string | string[]>;
    searchParams: Record<string, string | string[] | undefined>;
  },
  parent: ResolvingMetadata
) => Promise<Metadata>;
export function withParamValidation<T extends AllRoutes>(
  f: (props: RouterOutputs[T], parent: ResolvingMetadata) => Promise<Metadata>,
  validator: DynamicRoute
): GenerateMetadataFunction {
  const returnFunction: GenerateMetadataFunction = async (props, parent) => {
    // pull out the params and searchParams from the props
    const { params, searchParams, ...otherProps } = props;

    // if the validator has routeParams, parse them
    let parsedRouteParamsResult = undefined;
    if (validator.routeParams) {
      parsedRouteParamsResult = parseServerSideParams({
        params,
        validator: validator.routeParams,
      });
    }

    // if the validator has searchParams, parse them
    let parsedSearchParamsResult = undefined;
    if (validator.searchParams) {
      parsedSearchParamsResult = parseServerSideParams({
        params: searchParams ?? {},
        validator: validator.searchParams,
      });
    }

    // if either of the parsing results are errors, throw them
    if (parsedRouteParamsResult?.isError) {
      throw parsedRouteParamsResult.error;
    } else if (parsedSearchParamsResult?.isError) {
      throw parsedSearchParamsResult.error;
    }

    // combine the parsed params and searchParams into a single object with the rest of the props passed to the component
    const newProps = {
      routeParams: parsedRouteParamsResult?.data,
      searchParams: parsedSearchParamsResult?.data,
      ...otherProps,
    };

    // call the original function with the new props
    // @ts-expect-error we just parsed the params so they are guaranteed to match the types
    return f(newProps, parent);
  };
  return returnFunction;
}
