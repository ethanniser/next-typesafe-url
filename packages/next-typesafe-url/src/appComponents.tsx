import { parseServerSideParams } from "./utils";
import type { DynamicRoute, DynamicLayout } from "./types";
import { type ReactElement } from "react";

type NextAppPageProps = {
  params: Record<string, string | string[]>;
  searchParams: { [key: string]: string | string[] | undefined };
} & Record<string, unknown>;
type SomeReactComponent = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- I think this is reasonable here
  ...args: any
) => JSX.Element | Promise<JSX.Element>;

export function withParamValidation(
  Component: SomeReactComponent,
  validator: DynamicRoute
): SomeReactComponent {
  const ValidatedPageComponent: SomeReactComponent = (
    props: NextAppPageProps
  ) => {
    const { params, searchParams, ...otherProps } = props;

    let parsedRouteParams = undefined;

    if (validator.routeParams) {
      parsedRouteParams = parseServerSideParams({
        params,
        validator: validator.routeParams,
      });
    }

    let parsedSearchParams = undefined;
    if (validator.searchParams) {
      parsedSearchParams = parseServerSideParams({
        params: searchParams ?? {},
        validator: validator.searchParams,
      });
    }

    if (parsedRouteParams?.isError) {
      throw parsedRouteParams.error;
    } else if (parsedSearchParams?.isError) {
      throw parsedSearchParams.error;
    }

    const newProps = {
      routeParams: parsedRouteParams?.data,
      searchParams: parsedSearchParams?.data,
      ...otherProps,
    };

    // @ts-expect-error async server component
    return <Component {...newProps} />;
  };

  return ValidatedPageComponent;
}

export function withLayoutParamValidation(
  Component: SomeReactComponent,
  validator: DynamicLayout
): SomeReactComponent {
  const ValidatedPageComponent: SomeReactComponent = (
    props: Pick<NextAppPageProps, "params"> & { children: ReactElement }
  ) => {
    const { params, children, ...otherProps } = props;

    let parsedRouteParams = undefined;

    if (validator.routeParams) {
      parsedRouteParams = parseServerSideParams({
        params,
        validator: validator.routeParams,
      });
    }

    if (parsedRouteParams?.isError) {
      throw parsedRouteParams.error;
    }

    const newProps = {
      routeParams: parsedRouteParams?.data,
      children,
      ...otherProps,
    };

    // @ts-expect-error async server component
    return <Component {...newProps} />;
  };

  return ValidatedPageComponent;
}
