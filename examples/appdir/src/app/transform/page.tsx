import { withParamValidation } from "next-typesafe-url/app";
import {
  $path,
  type InferPagePropsType,
  type RouterInputs,
  type RouterOutputs,
} from "next-typesafe-url";
import { Route, RouteType } from "./routeType";

type _TestInput = RouterInputs["/transform"];
type _TestOutput = RouterOutputs["/transform"];

type PageProps = InferPagePropsType<RouteType>;

const Page = ({ searchParams }: PageProps) => {
  const _test = $path({
    route: "/transform",
    searchParams: {
      foo: 5,
    },
  });

  return (
    <>
      <div>{`data: ${JSON.stringify(searchParams)}`}</div>
    </>
  );
};

export default withParamValidation(Page, Route);
