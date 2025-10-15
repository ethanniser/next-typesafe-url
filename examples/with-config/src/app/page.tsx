"use client";

import { $path } from "next-typesafe-url";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleNavigate = () => {
    // Type-safe navigation with route params
    const url = $path({
      route: "/blog/[slug]",
      routeParams: {
        slug: "my-first-post",
      },
    });
    router.push(url);
  };

  return (
    <div>
      <h1>Welcome to Next.js Typesafe URL</h1>
      <p>
        This example demonstrates using a config file (
        <code>next-typesafe-url.config.ts</code>) instead of CLI arguments.
      </p>

      <h2>Features:</h2>
      <ul>
        <li>✅ Type-safe routing</li>
        <li>✅ Configuration file support</li>
        <li>✅ Next.js 15 and React 19</li>
        <li>✅ Automatic type generation</li>
      </ul>

      <button
        onClick={handleNavigate}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          cursor: "pointer",
        }}
      >
        Navigate to Blog Post (Type-safe!)
      </button>
    </div>
  );
}
