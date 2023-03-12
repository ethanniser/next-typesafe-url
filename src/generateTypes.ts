import fs from "fs";
import path from "path";

export function getRoutesWithExportedRoute(
  basePath: string,
  dir: string,
  exportedRoutes: string[] = [],
  filesWithoutExportedRoutes: string[] = []
) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getRoutesWithExportedRoute(
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
      const hasExportedRoute = /export\s+const\s+Route\b/.test(fileContent);

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

      if (hasExportedRoute) {
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
  doesntHaveRoute: string[]
): void {
  let importStatements = "";
  let routeCounter = 0;

  for (const route of hasRoute) {
    const routeVariableName = `Route_${routeCounter}`;
    importStatements += `import { type Route as ${routeVariableName} } from "~/pages${route}";\n`;
    routeCounter++;
  }

  const routeTypeDeclarations = hasRoute
    .map(
      (route) =>
        `  "${route}": InferRoute<typeof Route_${hasRoute.indexOf(route)}>;`
    )
    .join("\n");

  const staticRoutesDeclarations = doesntHaveRoute
    .map((route) => `  "${route}": StaticRoute;`)
    .join("\n");

  const additionalTypeDeclarations = `
export type AppRouter = StaticRouter & DynamicRouter;

type StaticRoutes = keyof StaticRouter;
type DynamicRoutes = keyof DynamicRouter;

import { type z } from "zod";

type StaticRoute = {
  searchParams: undefined;
  routeParams: undefined;
};

type DynamicRoute = {
  searchParams: z.AnyZodObject | undefined;
  routeParams: z.AnyZodObject | undefined;
};

type InferRoute<T extends DynamicRoute> = {
  searchParams: HandleUndefined<T["searchParams"]>;
  routeParams: HandleUndefined<T["routeParams"]>;
};

type PathOptions<T extends AllRoutes> = T extends StaticRoutes
  ? StaticPathOptions<T>
  : DynamicRouteOptions<T>;

type HandleUndefined<T extends z.AnyZodObject | undefined> =
  T extends z.AnyZodObject ? z.infer<T> : undefined;

type DynamicRouteOptions<T extends DynamicRoutes> = {
  path: T;
  searchParams?: SearchParams<T>;
  routeParams?: RouteParams<T>;
};

type StaticPathOptions<T extends StaticRoutes> = {
  path: T;
  searchParams?: undefined;
  routeParams?: undefined;
};

type AllRoutes = keyof AppRouter;

type SearchParams<T extends AllRoutes> = AppRouter[T]["searchParams"];
type RouteParams<T extends AllRoutes> = AppRouter[T]["routeParams"];

declare function $path<T extends AllRoutes>({
  path,
  searchParams,
  routeParams,
}: PathOptions<T>): string;
declare function useRouteParams<T extends z.AnyZodObject>(
  validator: T
): UseParamsResult<T>;
declare function useSearchParams<T extends z.AnyZodObject>(
  searchValidator: T
): UseParamsResult<T>;
type UseParamsResult<T extends z.AnyZodObject> =
  | {
      data: z.infer<T>;
      isReady: true;
      isError: false;
    }
  | {
      data: undefined;
      isReady: true;
      isError: true;
    }
  | {
      data: undefined;
      isReady: false;
      isError: false;
    };

export { $path, useRouteParams, useSearchParams };`;

  const fileContentString = `${importStatements}\ntype DynamicRouter = {\n${routeTypeDeclarations}\n};\n\ntype StaticRouter = {\n${staticRoutesDeclarations}\n};\n${additionalTypeDeclarations}\n`;

  fs.writeFileSync(
    "node_modules/next-typesafe-url/dist/index.d.ts",
    fileContentString
  );
}
