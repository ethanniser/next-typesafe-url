import type { NextPage } from "next";
import { $path, useRouteParams, useSearchParams } from "next-typesafe-url";
import Link from "next/link";
import { z } from "zod";

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

const Page: NextPage = () => {
  const { data: routeData, error: routeError } = useRouteParams(
    Route.routeParams
  );

  const { data: searchData, error: searchError } = useSearchParams(
    Route.searchParams
  );

  return (
    <>
      <Link href={$path({ route: "/" })}>Back</Link>
      <div>{`data: ${JSON.stringify(routeData)}`}</div>
      <div>{`error: ${JSON.stringify(routeError) ?? "no error"}`}</div>
      <br />
      <div>{`data: ${JSON.stringify(searchData)}`}</div>
      <div>{`error: ${JSON.stringify(searchError) ?? "no error"}`}</div>
    </>
  );
};

export default Page;
