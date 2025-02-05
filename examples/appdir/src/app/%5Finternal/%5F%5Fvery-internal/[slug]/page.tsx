import { withParamValidation } from "next-typesafe-url/app/hoc";
import { InferPagePropsType } from "next-typesafe-url";
import { Route, RouteType } from "./routeType";
import { Suspense } from "react";

type PageProps = InferPagePropsType<RouteType>;

const Inner = async ({ routeParams }: PageProps) => {
  const params = await routeParams;
  console.log(JSON.stringify(params));

  return <div>{`data: ${JSON.stringify(params)}`}</div>;
};
const Page = (props: PageProps) => {
  return (
    <Suspense>
      <Inner {...props} />
    </Suspense>
  );
};

export default withParamValidation(Page, Route);
