"use client";

import { $path, type RouterOutputs } from "next-typesafe-url";
import Link from "next/link";

type _ThisIsHelpful = RouterOutputs["/[slug]/[...foo]"]["routeParams"];

export default function Page() {
  return (
    <div className="flex flex-col space-y-5">
      <div>test</div>
      <Link
        href={$path({
          route: "/[slug]/[...foo]",
          routeParams: { slug: "string", foo: [123, 424, 343] },
          searchParams: {
            location: "us",
            userInfo: { name: "string", age: 123 },
          },
        })}
        className="hover:underline"
      >
        server component!
      </Link>
      <Link
        href={$path({
          route: "/client/[...client]",
          routeParams: { client: ["string", 123] },
          searchParams: {
            location: "us",
          },
        })}
        className="hover:underline"
      >
        link2
      </Link>
      <Link
        href={$path({
          route: "/jsonRoute/[foo]",
          routeParams: { foo: { foo: "bar" } },
        })}
        className="hover:underline"
      >
        json
      </Link>
    </div>
  );
}
