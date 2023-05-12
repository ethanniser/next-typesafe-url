"use client";

import { $path } from "next-typesafe-url";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next-typesafe-url/app";
import { Route } from "./routeType";

export const Client = () => {
  const [input, setInput] = useState("");

  const params = useSearchParams(Route.searchParams);

  return (
    <>
      <Link href={$path({ route: "/" })}>Back</Link>
      <br />
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <Link
        href={$path({
          route: "/path",
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
    </>
  );
};
