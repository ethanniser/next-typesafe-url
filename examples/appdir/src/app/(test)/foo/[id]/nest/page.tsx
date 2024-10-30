import { withParamValidation } from "next-typesafe-url/app/hoc";
import { InferPagePropsType } from "next-typesafe-url";
import { Route, RouteType } from "./routeType";
import { Suspense } from "react";

type PageProps = InferPagePropsType<RouteType>;

const Page = async ({ routeParams }: PageProps) => {
  const params = await routeParams;
  return (
    <Suspense>
      <div className="border border-black">
        <h1>NORMAL NEST PAGE</h1>
        <div>{`route: ${JSON.stringify(params)}`}</div>
      </div>
    </Suspense>
  );
};

export default withParamValidation(Page, Route);
