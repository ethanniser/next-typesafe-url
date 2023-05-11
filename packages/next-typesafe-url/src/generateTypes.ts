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
  dir: string,
  exportedRoutes: string[] = [],
  filesWithoutExportedRoutes: string[] = []
) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAPPRoutesWithExportedRoute(
        basePath,
        fullPath,
        exportedRoutes,
        filesWithoutExportedRoutes
      );
    } else {
      const fileName = path.basename(fullPath);

      if (fileName !== "page.tsx") return;

      const fileContent = fs.readFileSync(fullPath, "utf8");
      const hasExportedRouteType = /export\s+type\s+RouteType\b/.test(
        fileContent
      );

      let routePath = fullPath
        .replace(basePath, "")
        .replace(/\\/g, "/")
        .replace(/\/page\.tsx$/, "");

      if (dir === basePath) {
        routePath = "/";
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

export function generateTypesFile(
  hasRoute: string[],
  doesntHaveRoute: string[],
  type: "pages" | "app",
  dev: boolean
): void {
  let importStatements = "";
  let routeCounter = 0;

  for (const route of hasRoute) {
    const routeVariableName = `Route_${routeCounter}`;
    importStatements += `import { type RouteType as ${routeVariableName} } from "${
      dev ? `../../../examples/${type}dir/src/` : "../../../src/"
    }${type}${route === "/" ? "" : route}${type === "app" ? "/page" : ""}";\n`;
    routeCounter++;
  }

  const routeTypeDeclarations = hasRoute
    .map(
      (route) => `  "${route}": InferRoute<Route_${hasRoute.indexOf(route)}>;`
    )
    .join("\n");

  const staticRoutesDeclarations = doesntHaveRoute
    .map((route) => `  "${route}": StaticRoute;`)
    .join("\n");

  const additionalTypeDeclarations = `
import { z } from 'zod';

type AppRouter = StaticRouter & DynamicRouter;

type StaticRoutes = keyof StaticRouter;
type DynamicRoutes = keyof DynamicRouter;

type InferRoute<T extends DynamicRoute> = HandleUndefined<Helper<T>>;

type Helper<T extends DynamicRoute> = {
  searchParams: T["searchParams"] extends undefined
    ? undefined
    : z.infer<T["searchParams"]>;
  routeParams: T["routeParams"] extends undefined
    ? undefined
    : z.infer<T["routeParams"]>;
};

type HandleUndefined<T extends DynamicRoute> =
  T["routeParams"] extends undefined
    ? T["searchParams"] extends undefined
      ? // Both are undefined
        Option4<T>
      : // Only routeParams is undefined
        Option2<T>
    : T["searchParams"] extends undefined
    ? // Only searchParams is undefined
      Option3<T>
    : // Neither are undefined
      Option1<T>;

type Option1<T extends DynamicRoute> = AllPossiblyUndefined<
  T["searchParams"]
> extends undefined
  ? {
      searchParams?: T["searchParams"] | undefined;
      routeParams: T["routeParams"];
    }
  : {
      searchParams: T["searchParams"];
      routeParams: T["routeParams"];
    };

type Option2<T extends DynamicRoute> = AllPossiblyUndefined<
  T["searchParams"]
> extends undefined
  ? {
      searchParams?: T["searchParams"] | undefined;
      routeParams?: undefined;
    }
  : {
      searchParams: T["searchParams"];
      routeParams?: undefined;
    };

type Option3<T extends DynamicRoutes> = {
  searchParams?: undefined;
  routeParams: T["routeParams"];
};

type Option4<T extends DynamicRoutes> = {
  searchParams?: undefined;
  routeParams?: undefined;
};

type StaticRoute = {
  searchParams: undefined;
  routeParams: undefined;
};

type DynamicRoute = {
  searchParams?: z.AnyZodObject;
  routeParams?: z.AnyZodObject;
};

type PathOptions<T extends AllRoutes> = T extends StaticRoutes
  ? StaticPathOptions<T>
  : { route: T } & AppRouter[T];

type AllPossiblyUndefined<T> = Exclude<Partial<T>, undefined> extends T
  ? undefined
  : T;

type StaticPathOptions<T extends StaticRoutes> = {
  route: T;
  searchParams?: undefined;
  routeParams?: undefined;
};

type AllRoutes = keyof AppRouter;

type UseParamsResult<T extends z.AnyZodObject> =
  | {
      data: z.infer<T>;
      isValid: true;
      isReady: true;
      isError: false;
      error: undefined;
    }
  | {
      data: undefined;
      isValid: false;
      isReady: true;
      isError: true;
      error: z.ZodError<T>;
    }
  | {
      data: undefined;
      isValid: false;
      isReady: false;
      isError: false;
      error: undefined;
    };

type ServerParseParamsResult<T extends z.AnyZodObject> =
  | {
      data: z.infer<T>;
      isError: false;
      error: undefined;
    }
  | {
      data: undefined;
      isError: true;
      error: z.ZodError<T>;
    };

type InferPagePropsType<T extends DynamicRoute> = {
  searchParams: T["searchParams"] extends z.AnyZodObject
    ? z.infer<T["searchParams"]>
    : undefined;
  routeParams: T["routeParams"] extends z.AnyZodObject
    ? z.infer<T["routeParams"]>
    : undefined;
};

export { AppRouter as A, DynamicRoute as D, InferPagePropsType as I, PathOptions as P, ServerParseParamsResult as S, UseParamsResult as U, AllRoutes as a };
`;

  const fileContentString = `${importStatements}\ntype DynamicRouter = {\n${routeTypeDeclarations}\n};\n\ntype StaticRouter = {\n${staticRoutesDeclarations}\n};\n${additionalTypeDeclarations}\n`;

  fs.writeFileSync(
    "node_modules/next-typesafe-url/dist/types.d-fb432963.d.ts",
    fileContentString
  );
}
