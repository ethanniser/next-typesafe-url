import { withParamValidation } from "next-typesafe-url/app/hoc";
import { InferPagePropsType } from "next-typesafe-url";
import { Route, RouteType } from "./routeType";
import { Client } from "./client";

type PageProps = InferPagePropsType<RouteType>;

let count = 0;

const Page = async ({ routeParams, searchParams }: PageProps) => {
  console.log("render", count++);
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

export default withParamValidation(Page, Route);
