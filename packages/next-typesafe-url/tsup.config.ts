import { defineConfig } from "tsup";

export default defineConfig((opts) => ({
  entry: ["src/cli.ts", "src/index.ts", "src/app.ts", "src/pages.ts"],
  clean: !opts.watch,
  dts: true,
  format: ["cjs", "esm"],
  ignoreWatch: ["**/.turbo", "**/dist", "**/node_modules", "**/.git"],
}));
