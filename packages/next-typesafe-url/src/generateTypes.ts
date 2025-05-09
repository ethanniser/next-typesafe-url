import fs from "fs";
import path from "path";
import type { Paths, RouteInformation } from "./cli";

export function getPAGESRoutesWithExportedRoute({
  basePath,
  dir,
  hasRoute = [],
  doesntHaveRoute = [],
  pageExtensions,
  filename,
}: {
  basePath: string;
  dir: string;
  hasRoute?: string[];
  doesntHaveRoute?: string[];
  pageExtensions: string[];
  filename: string;
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
        filename,
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
        fileContent,
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
  filename,
}: {
  basePath: string;
  dir: string;
  hasRoute?: string[];
  doesntHaveRoute?: string[];
  pageExtensions: string[];
  filename: string;
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
        filename,
      });
    } else if (
      // Matches page files with the extensions from pageExtensions
      pageExtensions.map((p) => `page.${p}`).includes(file)
    ) {
      // With custom pageExtension
      let routePath = fullPath
        .replace(basePath, "")
        .replace(/\\/g, "/")
        .replace(new RegExp(`/page\\.(${pageExtensions.join("|")})$`), "");

      if (dir === basePath) {
        routePath = "/";
      }

      const routeTypePaths = ["ts", "tsx"].map((ext) =>
        path.join(dir, `${filename}.${ext}`),
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
  filename,
}: {
  appRoutesInfo: RouteInformation | null;
  pagesRoutesInfo: RouteInformation | null;
  paths: Paths;
  filename: string;
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
    .map(({ route: rawRoute, type }) => {
      const route = unescapeUnderscores(rawRoute);

      // For app routes, remove intercepted route segments.
      const finalRoute =
        type === "app" ? route.replace(/\/\([^()]+\)/g, "") || "/" : route;

      const pathAfterSrc = path.join(
        type,
        rawRoute === "/" ? "" : rawRoute,
        type === "app" ? filename : "",
      );

      const finalRelativePath = path
        .join(paths.relativePathFromOutputToSrc, pathAfterSrc)
        // replace backslashes with forward slashes
        .replace(/\\/g, "/")
        // ensure relative paths start with "./"
        .replace(/^(?!\.\.\/)/, "./");

      return `  "${finalRoute}": InferRoute<import("${finalRelativePath}").RouteType>;`;
    })
    .join("\n  ");

  const staticRoutesDeclarations = [
    ...allDoesntHaveRoute_app.map((rawRoute) => {
      const route = unescapeUnderscores(rawRoute);
      return `  "${route.replace(/\/\([^()]+\)/g, "") || "/"}": StaticRoute;`;
    }),
    ...allDoesntHaveRoute_pages.map((rawRoute) => {
      const route = unescapeUnderscores(rawRoute);
      return `  "${route}": StaticRoute;`;
    }),
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

// Helper function to normalize routes by replacing `%5F` with `_`.
//
// From the Next.js docs (https://nextjs.org/docs/app/getting-started/project-structure):
// ```
// You can create URL segments that start with an underscore by prefixing
// the folder name with %5F (the URL-encoded form of an underscore): %5FfolderName.
// ```
function unescapeUnderscores(route: string): string {
  return route.replace(/%5F/g, "_");
}

// thank you next-static-paths <3
const infoText = `
// This file is generated by next-typesafe-url
// Do not edit this file directly.

// @generated
// prettier-ignore
/* eslint-disable */
`;
