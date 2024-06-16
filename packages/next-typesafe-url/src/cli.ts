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
Scans for routes in your app and pages directories and generates a types file for next-typesafe-url

Options:
--watch / -w,  Watch for file changes in src/app and src/pages and regenerate the types file
--srcPath, The path to your src directory relative to the cwd the cli is run from. DEFAULT: "./src"
--outputPath, The path of the generated .d.ts file relative to the cwd the cli is run from. DEFAULT: "./_next-typesafe-url_.d.ts"
--pageExtensions, A comma separated list of file extensions to consider as. DEFAULT: "tsx,ts,jsx,js"
--help,  Show this help message
`;

const cli = meow(helpText, {
  flags: {
    watch: {
      type: "boolean",
      alias: "w",
    },
    outputPath: {
      type: "string",
      default: "./_next-typesafe-url_.d.ts",
    },
    srcPath: {
      type: "string",
      default: "./src",
    },
    pageExtensions: {
      type: "string",
      default: "tsx,ts,jsx,js",
    },
  },
});

export type Paths = {
  absolutePagesPath: string | null;
  absoluteAppPath: string | null;
  absoluteOutputPath: string;
  relativePathFromOutputToSrc: string;
};

export type RouteInformation = {
  hasRoute: string[];
  doesntHaveRoute: string[];
};

function build({
  paths,
  pageExtensions,
}: {
  paths: Paths;
  pageExtensions: string[];
}) {
  const { absoluteAppPath, absolutePagesPath } = paths;

  const appRoutesInfo = absoluteAppPath
    ? getAPPRoutesWithExportedRoute({
        basePath: absoluteAppPath,
        dir: absoluteAppPath,
        pageExtensions,
      })
    : null;
  const pagesRoutesInfo = absolutePagesPath
    ? getPAGESRoutesWithExportedRoute({
        basePath: absolutePagesPath,
        dir: absolutePagesPath,
        pageExtensions,
      })
    : null;

  generateTypesFile({
    appRoutesInfo,
    pagesRoutesInfo,
    paths,
  });
  console.log(`Generated route types`);
}

function watch({
  paths,
  pageExtensions,
}: {
  paths: Paths;
  pageExtensions: string[];
}) {
  const { absoluteAppPath, absolutePagesPath } = paths;

  if (absoluteAppPath) {
    chokidar
      .watch([`${absoluteAppPath}/**/*.{${pageExtensions.join(",")}}`])
      .on("change", () => {
        build({ paths, pageExtensions });
      });
  }
  if (absolutePagesPath) {
    chokidar
      .watch([`${absolutePagesPath}/**/*.{${pageExtensions.join(",")}}`])
      .on("change", () => {
        build({ paths, pageExtensions });
      });
  }

  console.log(`Watching for route changes`);
}

if (require.main === module) {
  const { srcPath, outputPath } = cli.flags;
  const pageExtensions = cli.flags.pageExtensions.split(",");

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

  const appPath = path.join(absoluteSrcPath, "app");
  const pagesPath = path.join(absoluteSrcPath, "pages");

  const absoluteAppPath = directoryExistsSync(appPath) ? appPath : null;
  const absolutePagesPath = directoryExistsSync(pagesPath) ? pagesPath : null;

  const paths = {
    absolutePagesPath,
    absoluteAppPath,
    absoluteOutputPath,
    relativePathFromOutputToSrc,
  };

  if (cli.flags.watch) {
    build({ paths, pageExtensions });
    watch({ paths, pageExtensions });
  } else {
    build({ paths, pageExtensions });
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
