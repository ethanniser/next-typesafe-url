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
Usage:
$ npx next-typesafe-url (...options)

Options:
--watch / -w,  Watch for routes changes
--pages / -p,  Pages directory
--app / -a,  App directory
--srcPath, The path to your src directory relative to the cwd the cli is run from. DEFAULT: "./src"
--outputPath, The path of the generated .d.ts file relative to the cwd the cli is run from. DEFAULT: "./.next-typesafe-url/routes.d.ts"
--help,  Show this help message
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
    outputPath: {
      type: "string",
      default: "./.next-typesafe-url/routes.d.ts",
    },
    srcPath: {
      type: "string",
      default: "./src",
    },
  },
});

function build(
  type: "pages" | "app",
  paths: {
    absoluteSrcPath: string;
    absoluteOutputPath: string;
    relativePathFromOutputToSrc: string;
  }
) {
  const appOrPagesPath = path.join(paths.absoluteSrcPath, type);

  const { exportedRoutes, filesWithoutExportedRoutes } =
    type === "pages"
      ? getPAGESRoutesWithExportedRoute(appOrPagesPath, appOrPagesPath)
      : getAPPRoutesWithExportedRoute(appOrPagesPath, appOrPagesPath);

  generateTypesFile(exportedRoutes, filesWithoutExportedRoutes, type, paths);
  console.log(`Generated route types`);
}

function watch(
  type: "pages" | "app",
  paths: {
    absoluteSrcPath: string;
    absoluteOutputPath: string;
    relativePathFromOutputToSrc: string;
  }
) {
  chokidar
    .watch([`${path.join(paths.absoluteSrcPath, type)}/**/*.{ts,tsx}`])
    .on("change", () => {
      build(type, paths);
    });
  console.log(`Watching for route changes`);
}

if (require.main === module) {
  if (cli.flags.pages && cli.flags.app) {
    console.log("You can only specify one of --pages or --app");
    process.exit(1);
  } else if (!cli.flags.pages && !cli.flags.app) {
    console.log("You must specify one of --pages or --app");
    process.exit(1);
  }

  const { srcPath, outputPath } = cli.flags;

  const absoluteSrcPath = path.join(process.cwd(), srcPath);

  if (!directoryExistsSync(absoluteSrcPath)) {
    console.log("srcPath is not a directory or does not exist");
    process.exit(1);
  }

  const absoluteOutputPath = path.join(process.cwd(), outputPath);
  const relativePathFromOutputToSrc = path.relative(
    path.dirname(absoluteOutputPath),
    absoluteSrcPath
  );

  const paths = {
    absoluteSrcPath,
    absoluteOutputPath,
    relativePathFromOutputToSrc,
  };

  const type = cli.flags.pages ? "pages" : "app";
  if (cli.flags.watch) {
    build(type, paths);
    watch(type, paths);
  } else {
    build(type, paths);
  }
}

import fs from "fs";
function directoryExistsSync(path: string): boolean {
  try {
    const stats = fs.statSync(path);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}
