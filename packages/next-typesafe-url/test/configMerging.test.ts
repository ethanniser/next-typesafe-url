import { describe, expect, test } from "vitest";
import { defaultConfig } from "../src/config";
import type { Config } from "../src/config";

/**
 * These tests verify the config merging logic used in cli.ts
 * The merging precedence is: CLI flags > Config file > Defaults
 */

// helper function that mimics the CLI merging logic
function mergeConfig(
  cliFlags: Partial<{
    watch: boolean;
    srcPath: string;
    outputPath: string;
    pageExtensions: string;
    filename: string;
  }>,
  fileConfig: Config | null,
) {
  const normalizePageExtensions = (
    extensions: string | string[] | undefined,
  ): string[] => {
    if (!extensions) return defaultConfig.pageExtensions;
    if (typeof extensions === "string") {
      return extensions.split(",").map((ext) => ext.trim());
    }
    return extensions;
  };

  return {
    watch: cliFlags.watch ?? fileConfig?.watch ?? defaultConfig.watch,
    srcPath: cliFlags.srcPath ?? fileConfig?.srcPath ?? defaultConfig.srcPath,
    outputPath:
      cliFlags.outputPath ?? fileConfig?.outputPath ?? defaultConfig.outputPath,
    filename:
      cliFlags.filename ?? fileConfig?.filename ?? defaultConfig.filename,
    pageExtensions: normalizePageExtensions(
      cliFlags.pageExtensions ?? fileConfig?.pageExtensions,
    ),
  };
}

describe("config merging", () => {
  describe("precedence: CLI > config file > defaults", () => {
    test("uses defaults when no CLI flags or config file", () => {
      const merged = mergeConfig({}, null);

      expect(merged).toEqual({
        watch: false,
        srcPath: "./src",
        outputPath: "./_next-typesafe-url_.d.ts",
        filename: "routeType",
        pageExtensions: ["tsx", "ts", "jsx", "js"],
      });
    });

    test("config file overrides defaults", () => {
      const merged = mergeConfig(
        {},
        {
          filename: "route-type",
          srcPath: "./app",
        },
      );

      expect(merged).toEqual({
        watch: false,
        srcPath: "./app",
        outputPath: "./_next-typesafe-url_.d.ts",
        filename: "route-type",
        pageExtensions: ["tsx", "ts", "jsx", "js"],
      });
    });

    test("CLI flags override config file", () => {
      const merged = mergeConfig(
        {
          filename: "cli-route",
        },
        {
          filename: "config-route",
          srcPath: "./app",
        },
      );

      expect(merged).toEqual({
        watch: false,
        srcPath: "./app", // from config
        outputPath: "./_next-typesafe-url_.d.ts",
        filename: "cli-route", // from CLI (overrides config)
        pageExtensions: ["tsx", "ts", "jsx", "js"],
      });
    });

    test("CLI flags override defaults directly", () => {
      const merged = mergeConfig(
        {
          filename: "cli-route",
          srcPath: "./custom",
        },
        null,
      );

      expect(merged).toEqual({
        watch: false,
        srcPath: "./custom",
        outputPath: "./_next-typesafe-url_.d.ts",
        filename: "cli-route",
        pageExtensions: ["tsx", "ts", "jsx", "js"],
      });
    });

    test("all three sources combined correctly", () => {
      const merged = mergeConfig(
        {
          watch: true, // CLI
        },
        {
          filename: "config-route", // config
          outputPath: "./types.d.ts", // config
        },
        // srcPath and pageExtensions will be defaults
      );

      expect(merged).toEqual({
        watch: true, // from CLI
        srcPath: "./src", // from defaults
        outputPath: "./types.d.ts", // from config
        filename: "config-route", // from config
        pageExtensions: ["tsx", "ts", "jsx", "js"], // from defaults
      });
    });
  });

  describe("pageExtensions normalization", () => {
    test("converts string to array", () => {
      const merged = mergeConfig(
        {
          pageExtensions: "mdx,tsx,ts",
        },
        null,
      );

      expect(merged.pageExtensions).toEqual(["mdx", "tsx", "ts"]);
    });

    test("trims whitespace from string", () => {
      const merged = mergeConfig(
        {
          pageExtensions: "mdx, tsx,  ts  ",
        },
        null,
      );

      expect(merged.pageExtensions).toEqual(["mdx", "tsx", "ts"]);
    });

    test("keeps array as array from config", () => {
      const merged = mergeConfig(
        {},
        {
          pageExtensions: ["mdx", "tsx"],
        },
      );

      expect(merged.pageExtensions).toEqual(["mdx", "tsx"]);
    });

    test("CLI string overrides config array", () => {
      const merged = mergeConfig(
        {
          pageExtensions: "js,jsx",
        },
        {
          pageExtensions: ["mdx", "tsx"],
        },
      );

      expect(merged.pageExtensions).toEqual(["js", "jsx"]);
    });

    test("uses defaults when undefined", () => {
      const merged = mergeConfig({}, {});

      expect(merged.pageExtensions).toEqual(["tsx", "ts", "jsx", "js"]);
    });
  });

  describe("boolean flags", () => {
    test("watch flag from CLI", () => {
      const merged = mergeConfig(
        {
          watch: true,
        },
        null,
      );

      expect(merged.watch).toBe(true);
    });

    test("watch flag from config", () => {
      const merged = mergeConfig(
        {},
        {
          watch: true,
        },
      );

      expect(merged.watch).toBe(true);
    });

    test("watch defaults to false", () => {
      const merged = mergeConfig({}, null);

      expect(merged.watch).toBe(false);
    });

    test("CLI watch overrides config watch", () => {
      const merged = mergeConfig(
        {
          watch: true,
        },
        {
          watch: false,
        },
      );

      expect(merged.watch).toBe(true);
    });
  });

  describe("individual options", () => {
    test("srcPath merging", () => {
      expect(mergeConfig({}, null).srcPath).toBe("./src");
      expect(mergeConfig({}, { srcPath: "./app" }).srcPath).toBe("./app");
      expect(mergeConfig({ srcPath: "./cli-src" }, null).srcPath).toBe(
        "./cli-src",
      );
      expect(
        mergeConfig({ srcPath: "./cli-src" }, { srcPath: "./config-src" })
          .srcPath,
      ).toBe("./cli-src");
    });

    test("outputPath merging", () => {
      expect(mergeConfig({}, null).outputPath).toBe(
        "./_next-typesafe-url_.d.ts",
      );
      expect(mergeConfig({}, { outputPath: "./types.d.ts" }).outputPath).toBe(
        "./types.d.ts",
      );
      expect(mergeConfig({ outputPath: "./cli.d.ts" }, null).outputPath).toBe(
        "./cli.d.ts",
      );
      expect(
        mergeConfig(
          { outputPath: "./cli.d.ts" },
          { outputPath: "./config.d.ts" },
        ).outputPath,
      ).toBe("./cli.d.ts");
    });

    test("filename merging", () => {
      expect(mergeConfig({}, null).filename).toBe("routeType");
      expect(mergeConfig({}, { filename: "route" }).filename).toBe("route");
      expect(mergeConfig({ filename: "cli-route" }, null).filename).toBe(
        "cli-route",
      );
      expect(
        mergeConfig({ filename: "cli-route" }, { filename: "config-route" })
          .filename,
      ).toBe("cli-route");
    });
  });

  describe("edge cases", () => {
    test("handles empty config object", () => {
      const merged = mergeConfig({}, {});

      expect(merged).toEqual({
        watch: false,
        srcPath: "./src",
        outputPath: "./_next-typesafe-url_.d.ts",
        filename: "routeType",
        pageExtensions: ["tsx", "ts", "jsx", "js"],
      });
    });

    test("handles full config with all options", () => {
      const merged = mergeConfig(
        {},
        {
          watch: true,
          srcPath: "./custom-src",
          outputPath: "./custom-output.d.ts",
          pageExtensions: ["mdx", "tsx"],
          filename: "custom-route",
        },
      );

      expect(merged).toEqual({
        watch: true,
        srcPath: "./custom-src",
        outputPath: "./custom-output.d.ts",
        filename: "custom-route",
        pageExtensions: ["mdx", "tsx"],
      });
    });

    test("handles CLI overriding all config options", () => {
      const merged = mergeConfig(
        {
          watch: false,
          srcPath: "./cli-src",
          outputPath: "./cli-output.d.ts",
          pageExtensions: "js,jsx",
          filename: "cli-route",
        },
        {
          watch: true,
          srcPath: "./config-src",
          outputPath: "./config-output.d.ts",
          pageExtensions: ["tsx", "ts"],
          filename: "config-route",
        },
      );

      expect(merged).toEqual({
        watch: false,
        srcPath: "./cli-src",
        outputPath: "./cli-output.d.ts",
        filename: "cli-route",
        pageExtensions: ["js", "jsx"],
      });
    });

    test("handles partial CLI flags with partial config", () => {
      const merged = mergeConfig(
        {
          filename: "cli-filename",
        },
        {
          srcPath: "./config-src",
          watch: true,
        },
      );

      expect(merged).toEqual({
        watch: true, // from config
        srcPath: "./config-src", // from config
        outputPath: "./_next-typesafe-url_.d.ts", // from defaults
        filename: "cli-filename", // from CLI
        pageExtensions: ["tsx", "ts", "jsx", "js"], // from defaults
      });
    });
  });
});
