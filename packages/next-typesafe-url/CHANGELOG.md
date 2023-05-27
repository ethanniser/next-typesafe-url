# next-typesafe-url

## 1.4.0

### Minor Changes

- 65d706b: hopefully final test

## 1.3.10

### Patch Changes

- f75bd07: maybe now

## 1.3.9

### Patch Changes

- c6f3122: npmignore

## 1.3.8

### Patch Changes

- 7c26b7b: final test

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
