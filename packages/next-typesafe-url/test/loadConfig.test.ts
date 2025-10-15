import { describe, expect, test, beforeEach, afterEach, vi } from "vitest";
import { loadConfig } from "../src/loadConfig";
import fs from "fs";
import path from "path";
import os from "os";

describe("loadConfig", () => {
  let tempDir: string;

  beforeEach(() => {
    // create a temporary directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "next-typesafe-url-test-"));
  });

  afterEach(() => {
    // clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe("config file discovery", () => {
    test("loads .ts config file", async () => {
      const configPath = path.join(tempDir, "next-typesafe-url.config.ts");
      fs.writeFileSync(
        configPath,
        `
        export default {
          filename: "route-type",
          srcPath: "./custom-src",
        };
      `,
      );

      const config = await loadConfig(tempDir);

      expect(config).toEqual({
        filename: "route-type",
        srcPath: "./custom-src",
      });
    });

    test("loads .js config file", async () => {
      const configPath = path.join(tempDir, "next-typesafe-url.config.js");
      fs.writeFileSync(
        configPath,
        `
        module.exports = {
          filename: "route",
          outputPath: "./types.d.ts",
        };
      `,
      );

      const config = await loadConfig(tempDir);

      expect(config).toEqual({
        filename: "route",
        outputPath: "./types.d.ts",
      });
    });

    test("loads .mjs config file", async () => {
      const configPath = path.join(tempDir, "next-typesafe-url.config.mjs");
      fs.writeFileSync(
        configPath,
        `
        export default {
          pageExtensions: ["tsx", "ts"],
        };
      `,
      );

      const config = await loadConfig(tempDir);

      expect(config).toEqual({
        pageExtensions: ["tsx", "ts"],
      });
    });

    test("loads .cjs config file", async () => {
      const configPath = path.join(tempDir, "next-typesafe-url.config.cjs");
      fs.writeFileSync(
        configPath,
        `
        module.exports = {
          watch: true,
        };
      `,
      );

      const config = await loadConfig(tempDir);

      expect(config).toEqual({
        watch: true,
      });
    });

    test("loads from package.json", async () => {
      const packagePath = path.join(tempDir, "package.json");
      fs.writeFileSync(
        packagePath,
        JSON.stringify({
          name: "test",
          "next-typesafe-url": {
            filename: "custom-route",
            srcPath: "./app",
          },
        }),
      );

      const config = await loadConfig(tempDir);

      expect(config).toEqual({
        filename: "custom-route",
        srcPath: "./app",
      });
    });

    test("returns null when no config file exists", async () => {
      const config = await loadConfig(tempDir);
      expect(config).toBeNull();
    });

    test("prioritizes .ts over .js", async () => {
      // Create both .ts and .js files
      fs.writeFileSync(
        path.join(tempDir, "next-typesafe-url.config.ts"),
        `export default { filename: "from-ts" };`,
      );
      fs.writeFileSync(
        path.join(tempDir, "next-typesafe-url.config.js"),
        `module.exports = { filename: "from-js" };`,
      );

      const config = await loadConfig(tempDir);

      // Should load .ts first
      expect(config).toEqual({ filename: "from-ts" });
    });
  });

  describe("config parsing", () => {
    test("parses valid full config", async () => {
      const configPath = path.join(tempDir, "next-typesafe-url.config.ts");
      fs.writeFileSync(
        configPath,
        `
        export default {
          watch: true,
          srcPath: "./src",
          outputPath: "./types.d.ts",
          pageExtensions: ["tsx", "ts", "jsx", "js"],
          filename: "route-type",
        };
      `,
      );

      const config = await loadConfig(tempDir);

      expect(config).toEqual({
        watch: true,
        srcPath: "./src",
        outputPath: "./types.d.ts",
        pageExtensions: ["tsx", "ts", "jsx", "js"],
        filename: "route-type",
      });
    });

    test("parses partial config", async () => {
      const configPath = path.join(tempDir, "next-typesafe-url.config.ts");
      fs.writeFileSync(
        configPath,
        `
        export default {
          filename: "route",
        };
      `,
      );

      const config = await loadConfig(tempDir);

      expect(config).toEqual({
        filename: "route",
      });
    });

    test("parses empty config object", async () => {
      const configPath = path.join(tempDir, "next-typesafe-url.config.ts");
      fs.writeFileSync(
        configPath,
        `
        export default {};
      `,
      );

      const config = await loadConfig(tempDir);

      expect(config).toEqual({});
    });

    test("handles pageExtensions as array", async () => {
      const configPath = path.join(tempDir, "next-typesafe-url.config.ts");
      fs.writeFileSync(
        configPath,
        `
        export default {
          pageExtensions: ["mdx", "tsx"],
        };
      `,
      );

      const config = await loadConfig(tempDir);

      expect(config?.pageExtensions).toEqual(["mdx", "tsx"]);
    });

    test("handles pageExtensions as string", async () => {
      const configPath = path.join(tempDir, "next-typesafe-url.config.ts");
      fs.writeFileSync(
        configPath,
        `
        export default {
          pageExtensions: "mdx,tsx",
        };
      `,
      );

      const config = await loadConfig(tempDir);

      expect(config?.pageExtensions).toBe("mdx,tsx");
    });
  });

  describe("TypeScript config with imports", () => {
    test("loads config that imports types", async () => {
      const configPath = path.join(tempDir, "next-typesafe-url.config.ts");
      fs.writeFileSync(
        configPath,
        `
        import type { Config } from "../src/config";

        const config: Config = {
          filename: "typed-route",
        };

        export default config;
      `,
      );

      const config = await loadConfig(tempDir);

      expect(config).toEqual({
        filename: "typed-route",
      });
    });
  });

  describe("error handling", () => {
    test("exits process for invalid config (non-object)", async () => {
      const configPath = path.join(tempDir, "next-typesafe-url.config.ts");
      fs.writeFileSync(
        configPath,
        `
        export default "invalid";
      `,
      );

      const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit called");
      });
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(loadConfig(tempDir)).rejects.toThrow("process.exit called");

      expect(exitSpy).toHaveBeenCalledWith(1);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Invalid config file"),
      );

      exitSpy.mockRestore();
      errorSpy.mockRestore();
    });

    test("exits process for syntax errors in TypeScript config", async () => {
      const configPath = path.join(tempDir, "next-typesafe-url.config.ts");
      fs.writeFileSync(
        configPath,
        `
        export default {
          filename: "test"
          missing: "comma"
        };
      `,
      );

      const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit called");
      });
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(loadConfig(tempDir)).rejects.toThrow("process.exit called");

      expect(exitSpy).toHaveBeenCalledWith(1);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Error loading config"),
      );

      exitSpy.mockRestore();
      errorSpy.mockRestore();
    });
  });

  describe("export styles", () => {
    test("handles default export", async () => {
      const configPath = path.join(tempDir, "next-typesafe-url.config.ts");
      fs.writeFileSync(
        configPath,
        `
        export default {
          filename: "default-export",
        };
      `,
      );

      const config = await loadConfig(tempDir);

      expect(config).toEqual({
        filename: "default-export",
      });
    });

    test("handles CommonJS module.exports", async () => {
      const configPath = path.join(tempDir, "next-typesafe-url.config.js");
      fs.writeFileSync(
        configPath,
        `
        module.exports = {
          filename: "commonjs-export",
        };
      `,
      );

      const config = await loadConfig(tempDir);

      expect(config).toEqual({
        filename: "commonjs-export",
      });
    });

    test("handles const with satisfies", async () => {
      const configPath = path.join(tempDir, "next-typesafe-url.config.ts");
      fs.writeFileSync(
        configPath,
        `
        import type { Config } from "../src/config";

        const config = {
          filename: "satisfies-export",
        } satisfies Config;

        export default config;
      `,
      );

      const config = await loadConfig(tempDir);

      expect(config).toEqual({
        filename: "satisfies-export",
      });
    });
  });
});
