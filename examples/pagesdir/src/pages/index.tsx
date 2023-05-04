import { $path } from "next-typesafe-url";
import Link from "next/link";

export default function Home() {
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
        hooks
      </Link>
      <br />
      <Link
        href={$path({
          route: "/[slug]/server",
          routeParams: { slug: "string" },
          searchParams: { location: "us" },
        })}
      >
        server
      </Link>
    </>
  );
}
