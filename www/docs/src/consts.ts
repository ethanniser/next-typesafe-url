export const SITE = {
  title: "next-typesafe-url",
  description:
    "Documentation for next-typesafe-url, a typesafe routing library for Next.js",
  defaultLanguage: "en-us",
} as const;

export const OPEN_GRAPH = {
  image: {
    src: "https://raw.githubusercontent.com/ethanniser/next-typesafe-url/main/www/docs/public/banner.png",
    alt:
      "next-typesafe-url: " +
      "Fully typesafe, JSON serializable, and zod validated URL search params, dynamic route params, and routing for NextJS.",
  },
  twitter: "ethanniser",
};

export const KNOWN_LANGUAGES = {
  English: "en",
} as const;
export const KNOWN_LANGUAGE_CODES = Object.values(KNOWN_LANGUAGES);

export const GITHUB_EDIT_URL = `https://github.com/ethanniser/next-typesafe-url/tree/main/www/docs`;

export const MY_TWITTER_LINK = "https://twitter.com/ethanniser";
export const MY_GITHUB_LINK = "https://github.com/ethanniser";
export const GH_REPO_LINK = "https://github.com/ethanniser/next-typesafe-url";

// See "Algolia" section of the README for more information.
// export const ALGOLIA = {
//   indexName: "XXXXXXXXXX",
//   appId: "XXXXXXXXXX",
//   apiKey: "XXXXXXXXXX",
// };

export type Sidebar = Record<
  (typeof KNOWN_LANGUAGE_CODES)[number],
  Record<string, { text: string; link: string }[]>
>;
export const SIDEBAR: Sidebar = {
  en: {
    General: [
      { text: "Motivations", link: "en/general/motivations" },
      { text: "Installation", link: "en/general/installation" },
    ],
    Setup: [
      {
        text: "Groundwork",
        link: "en/setup/groundwork",
      },
      {
        text: "Defining Your Routes",
        link: "en/setup/defining-your-routes",
      },
      { text: "Running the CLI", link: "en/setup/running-the-cli" },
    ],
    Usage: [
      {
        text: "Routing",
        link: "en/usage/routing",
      },
      {
        text: "Search/Route Params- App",
        link: "en/usage/search-route-params-app",
      },
      {
        text: "Search/Route Params- Pages",
        link: "en/usage/search-route-params-pages",
      },
      {
        text: "Additional Types",
        link: "en/usage/additional-types",
      },
    ],
    Reference: [{ text: "API Reference", link: "en/api-reference" }],
  },
};
