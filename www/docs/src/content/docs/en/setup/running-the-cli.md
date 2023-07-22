---
title: "Running the CLI"
description: "how to run the next-typesafe-url CLI"
nextPage:
  text: "Next: Routing"
  link: "en/usage/routing"
---

## What does the CLI do?

The CLI's purpose is to generate a file that contains a mapping of every possible route to a schema if you defined one.

This is required to be able to define the schemas in a convenient way (wherever the route is), and still have a single type representing all possible routes and their schemas that can be used to generate links.

### src

`next-typesafe-url` requires that you have a `src` directory in your project, and that your `pages` and `app` directories are inside of it.

```
└── src
    └── app
    // or/and
    └── pages
```

It doesn't where `src` is located, but it must exist.

## Running the CLI

```
Usage:
$ npx next-typesafe-url (...options)
```

### Options:

#### --watch / -w

Running the CLI with the `--watch` or `-w` flag will cause the CLI to watch for changes in your `src/app` and `src/pages` directories and automatically regenerate the types file when it detects a change.

#### --srcPath

The path to your `src` directory relative to the cwd the cli is run from. DEFAULT: `"./src"`

#### --outputPath

The path of the generated `.d.ts` file relative to the cwd the cli is run from. DEFAULT: `"./next-typesafe-url_.d.ts"`

#### --help

Show this information

### Add to your package.json scripts

Add `next-typesafe-url` to your dev and build script in package.json.

This will ensure that the types are generated before the build, and that they are regenerated when you make changes in dev mode.

For dev mode, you can either run it in a seperate shell, or in the same one as `next dev` with the [concurrently](https://www.npmjs.com/package/concurrently) package.

```json
{
  "scripts": {
    "build": "next-typesafe-url && next build",

    "dev": "concurrently  \"next-typesafe-url -w\" \"next dev\"",
    // OR
    "dev:url": "next-typesafe-url -w"
  }
}
```

<h4>Now we're ready to start routing and consuming params!<h4>
