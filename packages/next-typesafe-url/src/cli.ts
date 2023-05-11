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
    dontUseDev: {
      type: "boolean",
    },
  },
});

function build(type: "pages" | "app", dev: boolean) {
  const dirPath = path.join(process.cwd(), `/src/${type}`);
  console.log(dirPath);

  const { exportedRoutes, filesWithoutExportedRoutes } =
    type === "pages"
      ? getPAGESRoutesWithExportedRoute(dirPath, dirPath)
      : getAPPRoutesWithExportedRoute(dirPath, dirPath);

  generateTypesFile(exportedRoutes, filesWithoutExportedRoutes, type, dev);
  console.log(`Generated route types ${dev ? "IN DEV MODE" : ""}`);
}

function watch(type: "pages" | "app", dev: boolean) {
  chokidar
    .watch([path.join(process.cwd(), `/src/${type}/**/*.{ts,tsx}`)])
    .on("change", () => {
      build(type, dev);
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

  const dev = cli.flags.dontUseDev !== undefined ? cli.flags.dontUseDev : false;

  if (cli.flags.watch) {
    build(cli.flags.pages ? "pages" : "app", dev);
    watch(cli.flags.pages ? "pages" : "app", dev);
  } else {
    build(cli.flags.pages ? "pages" : "app", dev);
  }
}
