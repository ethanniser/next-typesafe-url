#!/usr/bin/env node
import meow from "meow";
import path from "path";
import chokidar from "chokidar";
import {
  getPAGESRoutesWithExportedRoute,
  getAPPRoutesWithExportedRoute,
  generateTypesFile,
} from "./generateTypes";

const helpText = `
Usage
$ next-something
Options
--watch, -w  Watch for routes changes
--pages, -p  Pages directory
--app, -a  App directory
`;

const cli = meow(helpText, {
  flags: {
    watch: {
      type: "boolean",
      alias: "w",
    },
    pages: {
      type: "boolean",
      alias: "p",
    },
    app: {
      type: "boolean",
      alias: "a",
    },
  },
});

function build(type: "pages" | "app") {
  const dirPath = path.join(process.cwd(), `/src/${type}`);

  const { exportedRoutes, filesWithoutExportedRoutes } =
    type === "pages"
      ? getPAGESRoutesWithExportedRoute(dirPath, dirPath)
      : getAPPRoutesWithExportedRoute(dirPath, dirPath);

  generateTypesFile(exportedRoutes, filesWithoutExportedRoutes, type);
  console.log("Generated route types");
}

function watch(type: "pages" | "app") {
  chokidar
    .watch([path.join(process.cwd(), `/src/${type}/**/*.{ts,tsx}`)])
    .on("change", () => {
      build(type);
    });
  console.log(`Watching for route file changes in ${type} directory...`);
}

if (require.main === module) {
  if (cli.flags.pages && cli.flags.app) {
    console.log("You can only specify one of --pages or --app");
    process.exit(1);
  } else if (!cli.flags.pages && !cli.flags.app) {
    console.log("You must specify one of --pages or --app");
    process.exit(1);
  }

  if (cli.flags.watch) {
    build(cli.flags.pages ? "pages" : "app");
    watch(cli.flags.pages ? "pages" : "app");
  } else {
    build(cli.flags.pages ? "pages" : "app");
  }
}
