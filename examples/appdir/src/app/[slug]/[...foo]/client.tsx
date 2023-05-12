"use client";

import { $path } from "next-typesafe-url";
import Link from "next/link";
import { useState } from "react";
import { useRouteParams, useSearchParams } from "next-typesafe-url/app";
import { Route } from "./routeType";

export const Client = () => {
  const [input, setInput] = useState("");

  const params = useSearchParams(Route.searchParams);
  const routeParams = useRouteParams(Route.routeParams);

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
            userInfo: { name: "harry", age: 123 },
          },
        })}
      >
        hooks
      </Link>
      <br />
      <h1>searchParams</h1>
      <div>{`data: ${JSON.stringify(params)}`}</div>
      <h1>routeParams</h1>
      <div>{`data: ${JSON.stringify(routeParams)}`}</div>
    </>
  );
};
