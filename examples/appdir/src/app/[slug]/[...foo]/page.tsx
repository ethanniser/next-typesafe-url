import { withParamValidation } from "next-typesafe-url/server";
import { InferPagePropsType } from "next-typesafe-url/server";
import { Route } from "./routetype";
import { Client } from "./client";

export type RouteType = typeof Route;
type PageProps = InferPagePropsType<RouteType>;

const Page = ({ routeParams, searchParams }: PageProps) => {
  return (
    <>
      <div>{`data: ${JSON.stringify(routeParams)}`}</div>
      <br />
      <div>{`data: ${JSON.stringify(searchParams)}`}</div>
      <Client />
    </>
  );
};

export default withParamValidation(Page, Route);
