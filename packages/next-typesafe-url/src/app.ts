// !!! huge credit to yesmeck https://github.com/yesmeck/remix-routes as well as Tanner Linsley https://tanstack.com/router/v1 for the inspiration for this

import type { UseParamsResult } from "./types";
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
} from "./utils";

function usePrevious<T>(value: T) {
  const ref = useRef<T>();
  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes
  // Return previous value (happens before update in useEffect above)
  return ref.current;
}

export {
  withLayoutParamValidation,
  withParamValidation,
} from "./appComponents";

export function useRouteParams<T extends z.AnyZodObject>(
  validator: T
): UseParamsResult<T> {
  const params = useParams();
  const prev = usePrevious(params);
  const same = JSON.stringify(prev) === JSON.stringify(params);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<z.ZodError>(new z.ZodError([]));
  const [data, setData] = useState<z.output<T> | undefined>(undefined);

  useEffect(() => {
    const parsedRouteParams = parseObjectFromStringRecord(params);
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
): UseParamsResult<T> {
  const params = useNextSearchParams();
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<z.ZodError>(new z.ZodError([]));
  const [data, setData] = useState<z.output<T> | undefined>(undefined);

  useEffect(() => {
    const parsedSearchParams = parseObjectFromReadonlyURLParams(params);
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
