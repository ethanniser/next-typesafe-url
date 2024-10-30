const withMDX = require("@next/mdx")();

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  experimental: {
    ppr: true,
    dynamicIO: true,
  },
};

module.exports = withMDX(nextConfig);
