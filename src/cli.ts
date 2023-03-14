#!/usr/bin/env node
import meow from "meow";
import path from "path";
import chokidar from "chokidar";
import { getRoutesWithExportedRoute, generateTypesFile } from "./generateTypes";

const helpText = `
Usage
$ next-something
Options
--watch, -w  Watch for routes changes
`;

const cli = meow(helpText, {
  flags: {
    watch: {
      type: "boolean",
      alias: "w",
    },
  },
});

function build() {
  const pagesPath = path.join(process.cwd(), "/src/pages");

  const { exportedRoutes, filesWithoutExportedRoutes } =
    getRoutesWithExportedRoute(pagesPath, pagesPath);

  generateTypesFile(exportedRoutes, filesWithoutExportedRoutes);
  console.log("Generated route types");
}

function watch() {
  chokidar
    .watch([path.join(process.cwd(), "/src/pages/**/*.{ts,tsx}")])
    .on("change", () => {
      build();
    });
  console.log("Watching for route file changes...");
}

if (require.main === module) {
  if (cli.flags.watch) {
    build();
    watch();
  } else {
    build();
  }
}
