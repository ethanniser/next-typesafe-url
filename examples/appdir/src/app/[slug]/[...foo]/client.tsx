"use client";

import { $path } from "next-typesafe-url";
import Link from "next/link";
import { useState } from "react";
import { useMyParams } from "next-typesafe-url/app";

export const Client = () => {
  const [input, setInput] = useState("");

  const params = useMyParams();

  return (
    <>
      <Link href={$path({ route: "/" })}>Back</Link>
      <br />
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <Link
        href={$path({
          route: "/[slug]/[...foo]",
          routeParams: {
            slug: "string",
            foo: [123, 424, 343],
          },
          searchParams: {
            location: "us",
            userInfo: { name: input === "" ? "default" : input, age: 123 },
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
