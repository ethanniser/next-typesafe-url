"use client";

import { $path, type AppRouter } from "next-typesafe-url";
import Link from "next/link";

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
      <Link
        href={$path({
          route: "/path",
          searchParams: {
            location: "us",
          },
        })}
      >
        link2
      </Link>
    </>
  );
}
