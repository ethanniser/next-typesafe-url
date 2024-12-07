import { withParamValidation } from "next-typesafe-url/app/hoc";
import {
  $path,
  type InferPagePropsType,
  type RouterInputs,
  type RouterOutputs,
} from "next-typesafe-url";
import { Route, RouteType } from "./routeType";
import { Suspense } from "react";

type _TestInput = RouterInputs["/transform"];
type _TestOutput = RouterOutputs["/transform"];

type PageProps = InferPagePropsType<RouteType>;

const Inner = async ({ searchParams }: PageProps) => {
  const _test = $path({
    route: "/transform",
    searchParams: {
      foo: 5,
    },
  });

  return (
    <>
      <div>{`data: ${JSON.stringify(await searchParams)}`}</div>
    </>
  );
};
const Page = (props: PageProps) => {
  return (
    <Suspense>
      <Inner {...props} />
    </Suspense>
  );
};

export default withParamValidation(Page, Route);
