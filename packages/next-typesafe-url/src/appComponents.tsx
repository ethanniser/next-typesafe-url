import { parseServerSideParams } from "./utils";
import type { DynamicRoute, DynamicLayout } from "./types";
import { type ReactElement } from "react";

// the props passed to a page component by Next.js
// https://nextjs.org/docs/app/api-reference/file-conventions/page
type NextAppPageProps = {
  params: Record<string, string | string[]>;
  searchParams: { [key: string]: string | string[] | undefined };
} & Record<string, unknown>;

type SomeReactComponent = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- describing a generic component
  ...args: any[]
) => JSX.Element | Promise<JSX.Element>;

/**
 * A HOC that validates the params passed to a page component.
 * The component you wrap with this should use `InferPagePropsType` for its props.
 * It should be the default export of `page.tsx`.
 * @param Component - the page component to wrap
 * @param validator - the validator to use, this should be your `Route` object
 *
 * @example export default withParamValidation(Page, Route);
 */
export function withParamValidation(
  Component: SomeReactComponent,
  validator: DynamicRoute
): SomeReactComponent {
  // the new component that will be returned
  const ValidatedPageComponent: SomeReactComponent = (
    props: NextAppPageProps
  ) => {
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

    // render the original component with the new props
    // @ts-expect-error async server component
    return <Component {...newProps} />;
  };

  // return the new component
  return ValidatedPageComponent;
}

/**
 * A HOC that validates the route params passed to a layout component.
 * It should be the default export of `layout.tsx`.
 * The component you wrap with this should use `InferLayoutPropsType` for its props.
 * @param Component - the layour component to wrap
 * @param validator - the validator to use, this should be your `LayoutRoute` object
 *
 * @example export default withLayoutParamValidation(Layout, LayoutRoute);
 */
export function withLayoutParamValidation(
  Component: SomeReactComponent,
  validator: DynamicLayout
): SomeReactComponent {
  // the new component that will be returned
  const ValidatedPageComponent: SomeReactComponent = (
    props: Pick<NextAppPageProps, "params"> & { children: ReactElement }
  ) => {
    // pull out the params and children from the props
    const { params, children, ...otherProps } = props;

    // if the validator has routeParams, parse them
    let parsedRouteParamsResult = undefined;
    if (validator.routeParams) {
      parsedRouteParamsResult = parseServerSideParams({
        params,
        validator: validator.routeParams,
      });
    }

    // if the parsing result is an error, throw it
    if (parsedRouteParamsResult?.isError) {
      throw parsedRouteParamsResult.error;
    }

    // combine the parsed params and searchParams into a single object with the rest of the props passed to the component
    const newProps = {
      routeParams: parsedRouteParamsResult?.data,
      children,
      ...otherProps,
    };

    // render the original component with the new props
    // @ts-expect-error async server component
    return <Component {...newProps} />;
  };

  // return the new component
  return ValidatedPageComponent;
}
