// !!! huge credit to yesmeck https://github.com/yesmeck/remix-routes as well as Tanner Linsley https://tanstack.com/router/v1 for the inspiration for this

import { useRouter } from "next/router";
import { type z } from "zod";
import { useState, useEffect } from "react";
import {
  parseObjectFromParamString,
  getDynamicRouteParams,
  generateParamStringFromObject,
  fillPath,
} from "./utils";
import type { AllRoutes, PathOptions } from "./types";

export function $path<T extends AllRoutes>({
  path,
  searchParams,
  routeParams,
}: PathOptions<T>): string {
  let returnString = "";
  if (searchParams) {
    returnString = generateParamStringFromObject(searchParams);
  }
  if (routeParams) {
    const dynamicParamString = fillPath(path, routeParams);
    returnString = `${dynamicParamString}${returnString}`;
  }
  return returnString;
}

// ! Should only be used in top level route component or a component that you know will only be rendered in a certain route
export function useRouteParams<T extends z.AnyZodObject>(
  validator: T
): UseParamsResult<T> {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isError, setIsError] = useState(false);
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
      }
    }
  }, [router, validator]);

  if (isError && isReady) {
    return { data: undefined, isReady: true, isError: true };
  } else if (data !== undefined && isReady) {
    return { data: data, isReady: true, isError: false };
  } else {
    return { data: undefined, isReady: false, isError: false };
  }
}

// ! Should only be used in top level route component or a component that you know will only be rendered in a certain route
export function useSearchParams<T extends z.AnyZodObject>(
  searchValidator: T
): UseParamsResult<T> {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isError, setIsError] = useState(false);
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
      }
    }
  }, [router, searchValidator]);

  if (isError && isReady) {
    return { data: undefined, isReady: true, isError: true };
  } else if (data !== undefined && isReady) {
    return { data: data, isReady: true, isError: false };
  } else {
    return { data: undefined, isReady: false, isError: false };
  }
}

type UseParamsResult<T extends z.AnyZodObject> =
  | {
      data: z.infer<T>;
      isReady: true;
      isError: false;
    }
  | {
      data: undefined;
      isReady: true;
      isError: true;
    }
  | {
      data: undefined;
      isReady: false;
      isError: false;
    };
