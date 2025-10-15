/**
 * Configuration options for next-typesafe-url CLI
 */
export interface Config {
  /**
   * Watch for file changes in src/app and src/pages and regenerate the types file
   * @default false
   */
  watch?: boolean;

  /**
   * The path to your src directory relative to the cwd the cli is run from
   * @default "./src"
   */
  srcPath?: string;

  /**
   * The path of the generated .d.ts file relative to the cwd the cli is run from
   * @default "./_next-typesafe-url_.d.ts"
   */
  outputPath?: string;

  /**
   * A list of file extensions to consider as page files
   * Can be an array of strings or a comma-separated string
   * @default ["tsx", "ts", "jsx", "js"]
   */
  pageExtensions?: string[] | string;

  /**
   * Override the default name of the RouteType file in the app directory
   * @default "routeType"
   */
  filename?: string;
}

/**
 * Resolved configuration with all options explicitly set
 */
export interface ResolvedConfig {
  watch: boolean;
  srcPath: string;
  outputPath: string;
  pageExtensions: string[];
  filename: string;
}

/**
 * Default configuration values
 */
export const defaultConfig: ResolvedConfig = {
  watch: false,
  srcPath: "./src",
  outputPath: "./_next-typesafe-url_.d.ts",
  pageExtensions: ["tsx", "ts", "jsx", "js"],
  filename: "routeType",
};
