import type { NextPage } from "next";
import { z } from "zod";
import { DynamicRoute } from "next-typesafe-url";

const Route = {
  searchParams: z.object({
    foo: z.string(),
  }),
} satisfies DynamicRoute;
export type RouteType = typeof Route;

const Page: NextPage = () => {
  return <div>foo</div>;
};

export default Page;
