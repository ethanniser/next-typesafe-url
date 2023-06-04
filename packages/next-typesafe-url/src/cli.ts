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
    dtsPath: {
      type: "string",
      default: "./generated/static-paths.d.ts",
    },
    srcPath: {
      type: "string",
      default: "../../../src/",
    },
  },
});

function build(
  type: "pages" | "app",
  paths: { srcPath: string; dtsPath: string }
) {
  const dirPath = path.join(process.cwd(), `/src/${type}`);
  console.log(dirPath);

  const { exportedRoutes, filesWithoutExportedRoutes } =
    type === "pages"
      ? getPAGESRoutesWithExportedRoute(dirPath, dirPath)
      : getAPPRoutesWithExportedRoute(dirPath, dirPath);

  generateTypesFile(exportedRoutes, filesWithoutExportedRoutes, type, paths);
  console.log(`Generated route types`);
}

function watch(
  type: "pages" | "app",
  paths: { srcPath: string; dtsPath: string }
) {
  chokidar
    .watch([path.join(process.cwd(), `/src/${type}/**/*.{ts,tsx}`)])
    .on("change", () => {
      build(type, paths);
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

  const paths: { srcPath: string; dtsPath: string } = {
    srcPath: cli.flags.srcPath,
    dtsPath: cli.flags.dtsPath,
  };

  const type = cli.flags.pages ? "pages" : "app";
  if (cli.flags.watch) {
    build(type, paths);
    watch(type, paths);
  } else {
    build(type, paths);
  }
}
