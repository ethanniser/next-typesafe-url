import fs from "fs";
import path from "path";
import type { RouteInformation, Paths } from "./cli";

export function getPAGESRoutesWithExportedRoute(
  basePath: string,
  dir: string,
  hasRoute: string[] = [],
  doesntHaveRoute: string[] = []
): RouteInformation {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getPAGESRoutesWithExportedRoute(
        basePath,
        fullPath,
        hasRoute,
        doesntHaveRoute
      );
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

      if (fileName === "index.tsx" || fileName === "index.js") {
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

export function getAPPRoutesWithExportedRoute(
  basePath: string,
  dir: string = basePath,
  hasRoute: string[] = [],
  doesntHaveRoute: string[] = []
): RouteInformation {
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

      getAPPRoutesWithExportedRoute(
        basePath,
        fullPath,
        hasRoute,
        doesntHaveRoute
      );
    } else if (file === "page.tsx") {
      const routeTypePath = path.join(dir, "routeType.ts");
      let routePath = fullPath
        .replace(basePath, "")
        .replace(/\\/g, "/")
        .replace(/\/page\.tsx$/, "");

      if (dir === basePath) {
        routePath = "/";
      }

      if (fs.existsSync(routeTypePath)) {
        hasRoute.push(routePath);
      } else {
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
  const importStatements: string[] = [];
  let routeCounter = 0;

  const allHasRoute = [
    ...(appRoutesInfo?.hasRoute ?? []).map((route) => ({ route, type: "app" })),
    ...(pagesRoutesInfo?.hasRoute ?? []).map((route) => ({
      route,
      type: "pages",
    })),
  ].map((obj) => ({ ...obj, count: routeCounter++ }));
  const allDoesntHaveRoute = [
    ...(appRoutesInfo?.doesntHaveRoute ?? []),
    ...(pagesRoutesInfo?.doesntHaveRoute ?? []),
  ];

  for (const { route, type, count } of allHasRoute) {
    const routeVariableName = `Route_${count}`;
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
    importStatements.push(
      `import { type RouteType as ${routeVariableName} } from "${finalRelativePath}";`
    );
    routeCounter++;
  }

  importStatements.push(
    'import type { InferRoute, StaticRoute } from "next-typesafe-url";'
  );

  const routeTypeDeclarations = allHasRoute
    .map(
      ({ route, type, count }) =>
        `  "${
          type === "app" ? route.replace(/\/\([^()]+\)/g, "") : route
        }": InferRoute<Route_${count}>;`
    )
    .join("\n  ");

  const staticRoutesDeclarations = allDoesntHaveRoute
    .map((route) => `  "${route}": StaticRoute;`)
    .join("\n  ");

  const fileContentString = `${infoText}\n${importStatements.join("\n")}

declare module "@@@next-typesafe-url" {
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
