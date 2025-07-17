import type { ReactNode } from "react";
import { parseServerSideParams } from "../utils";
import type {
  DynamicRoute,
  DynamicLayout,
  InferPagePropsType,
  InferLayoutPropsType,
} from "../types";
import { z } from "zod";

// the props passed to a page component by Next.js
// https://nextjs.org/docs/app/api-reference/file-conventions/page
type NextAppPageProps = {
  params: Promise<Record<string, string | string[]>>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  // [key: string]: unknown;
};

/**
 * A HOC that validates the params passed to a page component.
 * The component you wrap with this should use `InferPagePropsType` for its props.
 * It should be the default export of `page.tsx`.
 * @param Component - the page component to wrap
 * @param validator - the validator to use, this should be your `Route` object
 *
 * @example export default withParamValidation(Page, Route);
 */
export function withParamValidation<Validator extends DynamicRoute>(
  Component: (
    props: InferPagePropsType<Validator>,
  ) => ReactNode | Promise<ReactNode>,
  validator: Validator,
): (props: NextAppPageProps) => JSX.Element {
  // the new component that will be returned
  const ValidatedPageComponent = (props: NextAppPageProps) => {
    // pull out the params and searchParams from the props
    const {
      params: paramsPromise,
      searchParams: searchParamsPromise,
      ...otherProps
    } = props;
    const params =
      paramsPromise instanceof Promise
        ? paramsPromise
        : Promise.resolve(paramsPromise);

    const routeParams = params
      .then((rawParams) => {
        // if the validator has routeParams, parse them
        let parsedRouteParamsResult = undefined;
        if (validator.routeParams) {
          parsedRouteParamsResult = parseServerSideParams({
            params: rawParams,
            validator: validator.routeParams,
          });
        }
        // if there are parsing errors, throw them
        if (parsedRouteParamsResult?.isError) {
          throw parsedRouteParamsResult.error;
        } else {
          return parsedRouteParamsResult?.data;
        }
      })
      .catch(catchHandler);
    const search =
      searchParamsPromise instanceof Promise
        ? searchParamsPromise
        : Promise.resolve(searchParamsPromise);
    const searchParams = search
      .then((rawSearchParams) => {
        // if the validator has searchParams, parse them
        let parsedSearchParamsResult = undefined;
        if (validator.searchParams) {
          parsedSearchParamsResult = parseServerSideParams({
            params: rawSearchParams ?? {},
            validator: validator.searchParams,
          });
        }
        // if there are parsing errors, throw them
        if (parsedSearchParamsResult?.isError) {
          throw parsedSearchParamsResult.error;
        } else {
          return parsedSearchParamsResult?.data;
        }
      })
      .catch(catchHandler);

    // combine the parsed params and searchParams into a single object with the rest of the props passed to the component
    const newProps = {
      routeParams,
      searchParams,
      ...otherProps,
    };

    // render the original component with the new props
    // return Component(newProps);
    // @ts-expect-error async server component
    return <Component {...newProps} />;
  };
  // return the new component
  return ValidatedPageComponent;
}

type ExcludeKnownKeys<Keys extends string> = Exclude<
  Keys,
  "routeParams" | "searchParams"
>;

type NextAppLayoutProps<AdditionalKeys extends string = never> = Pick<
  NextAppPageProps,
  "params"
> & {
  children: ReactNode;
} & {
  [key in ExcludeKnownKeys<AdditionalKeys>]: ReactNode;
};

/**
 * A HOC that validates the route params passed to a layout component.
 * It should be the default export of `layout.tsx`.
 * The component you wrap with this should use `InferLayoutPropsType` for its props.
 * @param Component - the layour component to wrap
 * @param validator - the validator to use, this should be your `LayoutRoute` object
 *
 * @example export default withLayoutParamValidation(Layout, LayoutRoute);
 */
export function withLayoutParamValidation<
  Validator extends DynamicLayout,
  const AdditionalKeys extends string = never,
>(
  Component: (
    props: InferLayoutPropsType<Validator, AdditionalKeys>,
  ) => ReactNode | Promise<ReactNode>,
  validator: Validator,
): (props: NextAppLayoutProps<AdditionalKeys>) => JSX.Element {
  // the new component that will be returned
  const ValidatedLayoutComponent = (
    props: NextAppLayoutProps<AdditionalKeys>,
  ) => {
    // pull out the params and children from the props
    const { params: paramsPromise, children, ...otherProps } = props;
    const params =
      paramsPromise instanceof Promise
        ? paramsPromise
        : Promise.resolve(paramsPromise);
    const routeParams = params
      .then((rawParams) => {
        // if the validator has routeParams, parse them
        let parsedRouteParamsResult = undefined;
        if (validator.routeParams) {
          parsedRouteParamsResult = parseServerSideParams({
            params: rawParams,
            validator: validator.routeParams,
          });
        }

        // if the parsing result is an error, throw it
        if (parsedRouteParamsResult?.isError) {
          throw parsedRouteParamsResult.error;
        } else {
          return parsedRouteParamsResult?.data;
        }
      })
      .catch(catchHandler);

    // combine the parsed params and searchParams into a single object with the rest of the props passed to the component
    const newProps = {
      routeParams,
      children,
      ...otherProps,
    };

    // render the original component with the new props
    // @ts-expect-error async server component
    return <Component {...newProps} />;
  };

  // return the new component
  return ValidatedLayoutComponent;
}

function catchHandler(error: unknown) {
  if (error instanceof z.ZodError) {
    throw error;
  }
  return void 0;
}
