import { cosmiconfig } from "cosmiconfig";
import createJiti from "jiti";
import path from "path";
import type { Config } from "./config";

const MODULE_NAME = "next-typesafe-url";

/**
 * Loads the next-typesafe-url configuration from a config file
 * Searches for configuration files in this order:
 * - next-typesafe-url.config.ts
 * - next-typesafe-url.config.js
 * - next-typesafe-url.config.mjs
 * - next-typesafe-url.config.cjs
 * - package.json (under "next-typesafe-url" key)
 *
 * @param searchFrom - Directory to start searching from (defaults to process.cwd())
 * @returns The loaded configuration or null if no config file found
 */
export async function loadConfig(searchFrom?: string): Promise<Config | null> {
  const explorer = cosmiconfig(MODULE_NAME, {
    searchPlaces: [
      `${MODULE_NAME}.config.ts`,
      `${MODULE_NAME}.config.js`,
      `${MODULE_NAME}.config.mjs`,
      `${MODULE_NAME}.config.cjs`,
      "package.json",
    ],
    loaders: {
      ".ts": createTypeScriptLoader(),
    },
  });

  try {
    const result = await explorer.search(searchFrom);

    if (!result || result.isEmpty) {
      return null;
    }

    const config = result.config;

    // validate that the config is an object
    if (typeof config !== "object" || config === null) {
      throw new Error(
        `Invalid config file at ${result.filepath}: Expected an object, got ${typeof config}`,
      );
    }

    return config as Config;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error loading config: ${error.message}`);
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Creates a loader for TypeScript config files using jiti
 */
function createTypeScriptLoader() {
  return (filepath: string) => {
    // create a jiti instance with the directory of the config file as the base
    const jiti = createJiti(path.dirname(filepath), {
      interopDefault: true,
      esmResolve: true,
    });

    try {
      // load the config file by its basename
      const loaded = jiti(`./${path.basename(filepath)}`);
      // handle both default exports and named exports
      return loaded.default || loaded;
    } catch (error) {
      throw new Error(
        `Failed to load TypeScript config from ${filepath}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };
}
