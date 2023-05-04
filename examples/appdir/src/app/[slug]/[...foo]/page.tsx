import { withParamValidation } from "next-typesafe-url/dist/server";
import { z } from "zod";
import { ClientLink } from "./client";

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
// type PageProps = InferPagePropsType<RouteType>;

const Page = ({ routeParams, searchParams }: any) => {
  return (
    <>
      <div>{`data: ${JSON.stringify(routeParams)}`}</div>
      <br />
      <div>{`data: ${JSON.stringify(searchParams)}`}</div>
      <ClientLink />
    </>
  );
};

export default withParamValidation(Page, Route);
