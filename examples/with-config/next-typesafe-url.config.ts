import type { Config } from "next-typesafe-url";

const config: Config = {
  // Optional: customize the output path
  outputPath: "./next_safe_routes.d.ts",
  // Optional: customize the src directory
  srcPath: "./src",
  // Optional: customize page extensions
  pageExtensions: ["tsx", "ts", "jsx", "js"],
  // Optional: customize the routeType filename
  filename: "route-type",
};

export default config;
