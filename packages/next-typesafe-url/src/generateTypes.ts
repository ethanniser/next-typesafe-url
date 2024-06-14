import fs from "fs";
import path from "path";
import type { Paths, RouteInformation } from "./cli";

export function getPAGESRoutesWithExportedRoute({
  basePath,
  dir,
  hasRoute = [],
  doesntHaveRoute = [],
  pageExtensions,
}: {
  basePath: string;
  dir: string;
  hasRoute?: string[];
  doesntHaveRoute?: string[];
  pageExtensions: string[];
}): RouteInformation {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getPAGESRoutesWithExportedRoute({
        basePath,
        dir: fullPath,
        hasRoute,
        doesntHaveRoute,
        pageExtensions,
      });
    } else {
      const fileName = path.basename(fullPath);
      if (
        fileName === "_app.tsx" ||
        fileName === "_document.tsx" ||
        fileName.startsWith("_") ||
        ![".tsx", ".js"].includes(path.extname(fullPath))
      ) {
        return;
      }

      const fileContent = fs.readFileSync(fullPath, "utf8");
      const hasExportedRouteType = /export\s+type\s+RouteType\b/.test(
        fileContent
      );

      let routePath = fullPath
        .replace(basePath, "")
        .replace(/\\/g, "/")
        .replace(/\/index\.(tsx|js)$/, "")
        .replace(/\.(tsx|js)$/, "");

      // Matches all the index files with extensions from the pageExtensions
      if (pageExtensions.map((ext) => `index.${ext}`).includes(fileName)) {
        if (dir === basePath) {
          routePath = "/";
        } else {
          routePath = routePath.replace(/\/index$/, "");
        }
      }

      if (hasExportedRouteType) {
        hasRoute.push(routePath);
      } else {
        doesntHaveRoute.push(routePath);
      }
    }
  });

  return {
    hasRoute,
    doesntHaveRoute,
  };
}

export function getAPPRoutesWithExportedRoute({
  basePath,
  dir = basePath,
  hasRoute = [],
  doesntHaveRoute = [],
  pageExtensions,
}: {
  basePath: string;
  dir: string;
  hasRoute?: string[];
  doesntHaveRoute?: string[];
  pageExtensions: string[];
}): RouteInformation {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      //parallel routes
      if (file.startsWith("@")) {
        return;
      }

      //intercepted routes- "(.)" "(..)" "(...)"
      if (
        /^\(\.\)(.+)$/.test(file) ||
        /^\(\.\.\)(.+)$/.test(file) ||
        /^\(\.\.\.\)(.+)$/.test(file)
      ) {
        return;
      }

      getAPPRoutesWithExportedRoute({
        basePath,
        dir: fullPath,
        hasRoute,
        doesntHaveRoute,
        pageExtensions,
      });
    } else if (
      // Matches page files with the extensions from pageExtensions
      pageExtensions.map((p) => `page.${p}`).includes(file)
    ) {
      let routePath = fullPath
        .replace(basePath, "")
        .replace(/\\/g, "/")
        .replace(/\/page\.tsx$/, "");

      if (dir === basePath) {
        routePath = "/";
      }

      const routeTypePaths = ["ts", "tsx"].map((ext) =>
        path.join(dir, `routeType.${ext}`)
      );
      const didAddRoute = routeTypePaths.reduce((didAdd, routeTypePath) => {
        // Avoid adding the same route twice
        if (didAdd) return true;

        if (fs.existsSync(routeTypePath)) {
          hasRoute.push(routePath);
          return true;
        }

        return false;
      }, false);

      if (!didAddRoute) {
        doesntHaveRoute.push(routePath);
      }
    }
  });

  return { hasRoute, doesntHaveRoute };
}

export function generateTypesFile({
  appRoutesInfo,
  pagesRoutesInfo,
  paths,
}: {
  appRoutesInfo: RouteInformation | null;
  pagesRoutesInfo: RouteInformation | null;
  paths: Paths;
}): void {
  let routeCounter = 0;

  const allHasRoute = [
    ...(appRoutesInfo?.hasRoute ?? []).map((route) => ({ route, type: "app" })),
    ...(pagesRoutesInfo?.hasRoute ?? []).map((route) => ({
      route,
      type: "pages",
    })),
  ].map((obj) => ({ ...obj, count: routeCounter++ }));
  const allDoesntHaveRoute_app = appRoutesInfo?.doesntHaveRoute ?? [];
  const allDoesntHaveRoute_pages = pagesRoutesInfo?.doesntHaveRoute ?? [];

  const routeTypeDeclarations = allHasRoute
    .map(({ route, type }) => {
      const pathAfterSrc = path.join(
        type,
        route === "/" ? "" : route,
        type === "app" ? "routeType" : ""
      );
      const finalRelativePath = path
        .join(paths.relativePathFromOutputToSrc, pathAfterSrc)
        // replace backslashes with forward slashes
        .replace(/\\/g, "/")
        // ensure relative paths start with "./"
        .replace(/^(?!\.\.\/)/, "./");
      return `  "${
        type === "app" ? route.replace(/\/\([^()]+\)/g, "") : route
      }": InferRoute<import("${finalRelativePath}").RouteType>;`;
    })
    .join("\n  ");

  const staticRoutesDeclarations = [
    ...allDoesntHaveRoute_app.map(
      (route) => `  "${route.replace(/\/\([^()]+\)/g, "")}": StaticRoute;`
    ),
    ...allDoesntHaveRoute_pages.map((route) => `  "${route}": StaticRoute;`),
  ].join("\n  ");

  const fileContentString = `${infoText.trim()}\n

declare module "@@@next-typesafe-url" {
  import type { InferRoute, StaticRoute } from "next-typesafe-url";
  
  interface DynamicRouter {
  ${routeTypeDeclarations}
  }

  interface StaticRouter {
  ${staticRoutesDeclarations}
  }
}
`;

  // Ensure the directory exists, create it if it doesn't
  fs.mkdirSync(path.dirname(paths.absoluteOutputPath), { recursive: true });
  fs.writeFileSync(paths.absoluteOutputPath, fileContentString);
}

// thank you next-static-paths <3
const infoText = `
// This file is generated by next-typesafe-url
// Do not edit this file directly.

// @generated
// prettier-ignore
/* eslint-disable */
`;
