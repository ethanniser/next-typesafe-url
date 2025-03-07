import { withParamValidation } from "next-typesafe-url/app/hoc";
import { InferPagePropsType } from "next-typesafe-url";
import { Route, RouteType } from "./routeType";
import { Client } from "./client";
import { Suspense } from "react";

type PageProps = InferPagePropsType<RouteType>;

const Inner = async ({ routeParams, searchParams }: PageProps) => {
  const params = await routeParams;
  const search = await searchParams;
  console.log(JSON.stringify(params));
  console.log(JSON.stringify(search));

  return (
    <>
      <div>{`data: ${JSON.stringify(params)}`}</div>
      <br />
      <div>{`data: ${JSON.stringify(search)}`}</div>
      <Client />
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
