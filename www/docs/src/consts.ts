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
    Docs: [
      { text: "App Directory", link: "en/app" },
      { text: "Pages Directory", link: "en/pages" },
    ],
  },
};
