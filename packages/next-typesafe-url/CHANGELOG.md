# next-typesafe-url

## 4.1.1

### Patch Changes

- 5ee638f: Fixed page useRouteParams error status not reset issue.

## 4.1.0

### Minor Changes

- fb7e555: - Added pageExtensions CLI flag.
  - Added .tsx extension support for routeType files.

## 4.0.8

### Patch Changes

- ef5ea79: fix `SomeReactComponent` typing- thanks @risk1996

## 4.0.7

### Patch Changes

- 8a97b77: Remove next peer dep req on v13 (add v14)

## 4.0.6

### Patch Changes

- 367ac24: Fix cli ambient .d.ts file generation (building upon PR #85 and #87). Thanks to @chungweileong94.

## 4.0.5

### Patch Changes

- 3371794: revert previous change of import placements in generated .d.ts file

## 4.0.4

### Patch Changes

- 482346f: Ensure codegen produce an ambient .d.ts file. Thank you @lelabo-m PR: #85

## 4.0.3

### Patch Changes

- 52d64c7: Remove route groups from Static Router

## 4.0.2

### Patch Changes

- 34083ef: Remove empty first line in the auto-generated file

## 4.0.1

### Patch Changes

- 56875fa: change default output file name to not conflict with package name and roll deps

## 4.0.0

### Major Changes

- b5aad73: moved the HOC to /app/hoc to get around use client bundling issues

### Minor Changes

- 686cbe9: merged parseServerSide\*Params to a single function

### Patch Changes

- 686cbe9: fixed bugged with $path that added "}" to the end
- 686cbe9: fixed issue with arrays being passed to non catch all portions of route params not being fully encoded

## 3.1.0

### Minor Changes

- 491ed9e: correctly infers zod inputs and outputs, mainly affects using `$path` with zod coercion/transform. Now exposes seperate `RouterInputs` and `RouterOutputs` types to account for this change

## 3.0.0

### Major Changes

- 88cdd83: - major changes

  - significant refactor to internal encoding + decoding logic- now simpler and easier to follow
  - complete documentation rewrite
  - code generation overhaul
    - no longer changes node_module files
    - now uses typescript modules to eliminate previous needs for restarting ts server
    - src path and output path completely customizable via cli
    - eliminated the need for app/pages flag
  - examples fully up to date with changes
  - medium changes
    - app and pages hooks now have identical type signatures
  - small changes
    - removed uneeded ‘loading’ useState
    - fixed type error when packing async server components to withParamValidation
    - properly handle jsx

  ## TO UPGRADE: [READ THE NEW DOCS]("https:next-typesafe-url.dev")

## 2.1.2

### Patch Changes

- b72937f: docs: update links to direct to docs website

## 2.1.1

### Patch Changes

- ab485bd: fix to only run route group removal in 'app' mode

## 2.1.0

### Minor Changes

- 4e9270f: added support for route groups, parallel routes and intercepted routes

## 2.0.0

### Major Changes

- 401f94e: Full support for App router and server components
  API overhaul and improved featureset

  **THIS IS A BREAKING CHANGE**
  Please refer to the updated documentation for how to use the new API

## 1.3.4

### Patch Changes

- 422c965: use relative path instead of ~, as this will work for anyone

## 1.3.3

### Patch Changes

- 2130e27: remove inferSSParams, docs suggest use of approuter type. also clarify example is not only way to use params

## 1.3.1

### Patch Changes

- 6c34180: feat: now allows searchparams to be undefined if all properities are optional

## 1.3.0

### Minor Changes

- d180798: added tools to parse params in gsp/gssp

### Patch Changes

- 56b482b: added inferserversideparamstype help
- 245a7dd: fix: now errors correctly when leaving required searchparams/routeparams undefined

## 1.2.3

### Patch Changes

- 7772eb8: docs: clarify route params can only be passed strings, numbers or booleans

## 1.2.2

### Patch Changes

- 7e105b8: fix deprecate please im sorry npm

## 1.2.1

### Patch Changes

- 4ed285c: docs: forgot to remove broken message

## 1.2.0

### Minor Changes

- 02907e4: fix: now explicitly export seperate type so as to not break next HMR

## 1.1.3

### Patch Changes

- 259a057: my bad guys

## 1.1.2

### Patch Changes

- 0bd683f: docs: rephrase how potential cli issues worded + presented

## 1.1.1

### Patch Changes

- 351372d: docs: fix dependency array in jotai example
- decd6c9: docs: clarify app router, add todo ts plugin, and clarify pages dir only in package desc

## 1.1.0

### Minor Changes

- 42d1457: semantic change from "path" to "route". The 'path' is the final string generated from the $path function. The 'route' is a route representing a file.

### Patch Changes

- fd26603: docs: fix line path -> route

## 1.0.14

### Patch Changes

- 44c2c1e: docs: minor clarification on behavior of passing undefined to path/url

## 1.0.13

### Patch Changes

- f87230b: docs: remove redundant isReady check + seperate jotai section

## 1.0.12

### Patch Changes

- 4cf1145: docs: $path example now shows correctly uri encoded url

## 1.0.11

### Patch Changes

- 70f1fad: builds immediately, even in watch mode

## 1.0.9

### Patch Changes

- a603d2c: minor edits to docs, and change to the cli message after generating types

## 1.0.8

### Patch Changes

- 47815c2: docs: added clarification on how to run dev script + reccomend concurrently

## 1.0.7

### Patch Changes

- 3c62ac9: feat: added isValid flag to prevent need to check isReady && !isError

## 1.0.6

### Patch Changes

- 65f090b: docs: clarify cli breakpoint and how to fix

## 1.0.5

### Patch Changes

- a30a8d8: fix: $path now behaves as intended under specific combinations of inputs

## 1.0.4

### Patch Changes

- 6d90758: fix: $path now correctly passes path even if routeParams is undefined

## 1.0.3

### Patch Changes

- e44541b: removed duplicate and incorrect useParamsResult type

## 1.0.2

### Patch Changes

- 1e0feee: docs: point out reserved string keywords, add example of using data, and rewrite current next routing description

## 1.0.1

### Patch Changes

- 7e8055b: docs: clarify pages dir, add useEffect to jotai example and clarify a possible silent error source

## 1.0.0

### Major Changes

- d7e4983: ship it.
