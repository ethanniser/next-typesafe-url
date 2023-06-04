import fs from "fs";
import path from "path";

export function getPAGESRoutesWithExportedRoute(
  basePath: string,
  dir: string,
  exportedRoutes: string[] = [],
  filesWithoutExportedRoutes: string[] = []
) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getPAGESRoutesWithExportedRoute(
        basePath,
        fullPath,
        exportedRoutes,
        filesWithoutExportedRoutes
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
        exportedRoutes.push(routePath);
      } else {
        filesWithoutExportedRoutes.push(routePath);
      }
    }
  });

  return { exportedRoutes, filesWithoutExportedRoutes };
}

export function getAPPRoutesWithExportedRoute(
  basePath: string,
  dir: string = basePath,
  exportedRoutes: string[] = [],
  filesWithoutExportedRoutes: string[] = []
) {
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
        exportedRoutes,
        filesWithoutExportedRoutes
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
        exportedRoutes.push(routePath);
      } else {
        filesWithoutExportedRoutes.push(routePath);
      }
    }
  });

  return { exportedRoutes, filesWithoutExportedRoutes };
}

export function generateTypesFile(
  hasRoute: string[],
  doesntHaveRoute: string[],
  type: "pages" | "app",
  paths: { srcPath: string; dtsPath: string }
): void {
  let importStatements = "";
  let routeCounter = 0;

  for (const route of hasRoute) {
    const routeVariableName = `Route_${routeCounter}`;
    importStatements += `import { type RouteType as ${routeVariableName} } from "${
      paths.srcPath
    }${type}${route === "/" ? "" : route}${
      type === "app" ? "/routeType" : ""
    }";\n`;
    routeCounter++;
  }

  if (routeCounter > 0) {
    importStatements += 'import { type InferRoute } from "next-typesafe-url";';
  }

  const routeTypeDeclarations = hasRoute
    .map(
      (route) =>
        `  "${
          type === "app" ? route.replace(/\/\([^()]+\)/g, "") : route
        }": InferRoute<Route_${hasRoute.indexOf(route)}>;`
    )
    .join("\n  ");

  const staticRoutesDeclarations = doesntHaveRoute
    .map((route) => `  "${route}": StaticRoute;`)
    .join("\n  ");

  const fileContentString = `${importStatements}

declare module "@@@next-typesafe-url" {
  interface DynamicRouter {
  ${routeTypeDeclarations}
  }

  interface StaticRouter {
  ${staticRoutesDeclarations}
  }
}
`;

  fs.writeFileSync(path.join(process.cwd(), paths.dtsPath), fileContentString);
}
