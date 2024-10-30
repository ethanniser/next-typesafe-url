import { withParamValidation } from "next-typesafe-url/app/hoc";
import { InferPagePropsType } from "next-typesafe-url";
import { Route, RouteType } from "./routeType";
import { Suspense } from "react";

type PageProps = InferPagePropsType<RouteType>;

const Page = async ({ routeParams }: PageProps) => {
  const params = await routeParams;
  console.log(params.foo === undefined);

  return (
    <Suspense>
      <div>{`data: ${JSON.stringify(params)}`}</div>
    </Suspense>
  );
};

export default withParamValidation(Page, Route);
