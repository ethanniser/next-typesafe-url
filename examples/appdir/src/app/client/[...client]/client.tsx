"use client";

import { $path } from "next-typesafe-url";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams, useRouteParams } from "next-typesafe-url/app";
import { Route } from "./routeType";

export const Client = () => {
  useEffect(() => {
    console.log("Component has been rendered");
  }, []);

  const [input, setInput] = useState("");
  const [input2, setInput2] = useState("");

  const params = useSearchParams(Route.searchParams);
  const routeParams = useRouteParams(Route.routeParams);

  return (
    <>
      <Link href={$path({ route: "/" })}>Back</Link>
      <br />
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <br />
      <input value={input2} onChange={(e) => setInput2(e.target.value)} />
      <Link
        href={$path({
          route: "/client/[...client]",
          routeParams: { client: [input2 === "" ? "default" : input2, 123] },
          searchParams: {
            location: input,
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
