"use client";

import { $path, type RouterOutputs } from "next-typesafe-url";
import Link from "next/link";

type _ThisIsHelpful = RouterOutputs["/[slug]/[...foo]"]["routeParams"];

export default function Page() {
  return (
    <>
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
      >
        server component!
      </Link>
    </>
  );
}
