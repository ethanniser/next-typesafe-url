import type { NextPage } from "next";
import { $path, type DynamicRoute } from "next-typesafe-url";
import { useRouteParams, useSearchParams } from "next-typesafe-url/pages";
import Link from "next/link";
import { useState } from "react";
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
} satisfies DynamicRoute;

export type RouteType = typeof Route;

const Page: NextPage = () => {
  const [input, setInput] = useState("");

  const { data: routeData, error: routeError } = useRouteParams(
    Route.routeParams
  );

  const { data: searchData, error: searchError } = useSearchParams(
    Route.searchParams
  );

  return (
    <>
      <Link href={$path({ route: "/" })}>Back</Link>
      <br />
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <Link
        href={$path({
          route: "/[slug]/[...foo]",
          routeParams: {
            slug: input === "" ? "default" : input,
            foo: [123, 424, 343],
          },
          searchParams: {
            location: "us",
            userInfo: { name: "string", age: 123 },
          },
        })}
      >
        hooks
      </Link>
      <br />
      <h1>routeParams</h1>
      <div>{`data: ${JSON.stringify(routeData)}`}</div>
      <div>{`error: ${JSON.stringify(routeError) ?? "no error"}`}</div>
      <br className="bg-black" />
      <h1>searchParams</h1>
      <div>{`data: ${JSON.stringify(searchData)}`}</div>
      <div>{`error: ${JSON.stringify(searchError) ?? "no error"}`}</div>
    </>
  );
};

export default Page;
