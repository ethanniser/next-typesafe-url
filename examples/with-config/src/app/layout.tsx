import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Next.js Typesafe URL - Config Example",
  description: "Demonstrating config file usage with next-typesafe-url",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
          <a href="/" style={{ marginRight: "1rem" }}>
            Home
          </a>
          <a href="/about" style={{ marginRight: "1rem" }}>
            About
          </a>
          <a href="/blog/example-post">Blog Post</a>
        </nav>
        <main style={{ padding: "2rem" }}>{children}</main>
      </body>
    </html>
  );
}
