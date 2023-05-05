import { withParamValidation } from "next-typesafe-url/dist/server";
import { InferPagePropsType } from "next-typesafe-url";
import { z } from "zod";
import { Client } from "./client";

const Route = {
  routeParams: z.object({
    slug: z.string(),
    foo: z.array(z.number()),
  }),
  searchParams: z.object({
    location: z.enum(["us", "eu"]).optional(),
    userInfo: z.object({
      name: z.string(),
      age: z.number(),
    }),
  }),
};

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
