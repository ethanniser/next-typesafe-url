import { withParamValidation } from "next-typesafe-url/app/hoc";
import { InferPagePropsType } from "next-typesafe-url";
import { Route, RouteType } from "./routeType";
import { Suspense } from "react";

type PageProps = InferPagePropsType<RouteType>;

const Page = ({ routeParams }: PageProps) => {
  console.log(routeParams.foo === undefined);

  return (
    <Suspense>
      <div>{`data: ${JSON.stringify(routeParams)}`}</div>
    </Suspense>
  );
};

export default withParamValidation(Page, Route);
