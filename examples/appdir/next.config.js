const withMDX = require("@next/mdx")();

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  // replaces experimental.ppr + experimental.dynamicIO from Next 15
  cacheComponents: true,
};

module.exports = withMDX(nextConfig);
