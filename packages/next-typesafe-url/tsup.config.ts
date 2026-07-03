import { defineConfig } from "tsup";

export default defineConfig((opts) => ({
  entry: [
    "src/cli.ts",
    "src/index.ts",
    "src/app/index.ts",
    "src/pages.ts",
    "src/app/hoc.tsx",
  ],
  clean: !opts.watch,
  dts: {
    compilerOptions: {
      // tsup injects `baseUrl` into the dts build, which TypeScript 6
      // rejects as deprecated (TS5101); scoped here, not in tsconfig.json
      ignoreDeprecations: "6.0",
    },
  },
  format: ["cjs", "esm"],
  ignoreWatch: ["**/.turbo", "**/dist", "**/node_modules", "**/.git"],
}));
