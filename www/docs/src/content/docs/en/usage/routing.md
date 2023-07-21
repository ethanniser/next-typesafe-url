---
title: "Routing"
description: "how to use next-typesafe-url's $path function to generate links"
nextPage:
  text: "Next: Search/Route Params- App"
  link: "en/usage/search-route-params-app"
---

## $path

The `$path` function is the core function of `next-typesafe-url`. It takes one argument, an object containing the route path, and any route or search params.

`$path` combines these inputs and returns string that represents the path for you to pass to the `href` prop of a `Link` component, or to `router.push`.

```tsx
import { $path } from "next-typesafe-url";

<Link
  href={$path({
    route: "/product/[productID]",
    routeParams: { productID: 23 },
    searchParams: { userInfo: { name: "bob", age: 23 } },
  })}
/>;

// this generates the following string:
// "/product/23?userInfo=%7B%22name%22%3A%22bob%22%2C%22age%22%3A23%7D"
```

`$path` is connected to the generated types files, so it will have full typesafety and autocomplete for all of your routes, route params, and search params.

**If the route is not a valid route, or any of the route params or search params are missing or of the wrong type, `$path` will show a type error.**

### CAN THROW

`$path` can throw at runtime if:

- If a dynamic segment or catch-all segment in the route does not have a corresponding value in routeParams.
- If any of the passed values are not a non-empty string (except for search params), number, boolean, array, object, or null.

_Neither should never happen if you are not ignoring the many typescript errors that would be thrown at you._

### Important Quirks

#### Passing `undefined` for route params

If `undefined` is explictly passed as a **route param** for a dynamic or non-optinal catch-all segment, `$path` will throw at runtime to avoid something like `/foo//bar`. If undefined is passed for an optional catch-all segment, it will be ignored.

```ts
$path({ route: "/foo/[bar]", routeParams: { bar: undefined } });
// THROWS! Cannot pass undefined for a dynamic segment

$path({ route: "/foo/[...bar]", routeParams: { bar: undefined } });
// THROWS! Cannot pass undefined for a catch-all segment

$path({ route: "/foo/[[...bar]]", routeParams: { bar: undefined } });
// "/foo" Optional catch-all segments are ignored if undefined is passed
```

#### Passing `undefined` or `""` for search params

If `undefined` **OR** and empty string is explictly passed as a **search param**, it will be passed to the url without a corresponding value. This is different from leaving it out entirely, which will not include the search param in the url at all.

```ts
$path({ route: "/foo", searchParams: { bar: undefined } });
// "/foo?bar" undefined is passed as a search param without a value

$path({ route: "/foo", searchParams: { bar: "" } });
// "/foo?bar" An empty string is passed as a search param without a value
```

#### Passing data to catch-all segments

Catch all segments can be passed either an array or a value. If an array is passed, the values will be joined with a `/` in the url.

```ts
$path({ route: "/foo/[...bar]", routeParams: { bar: ["a", "b", "c"] } });
// "/foo/a/b/c"

$path({ route: "/foo/[...bar]", routeParams: { bar: "a" } });
// "/foo/a"
```

---

<h4 class="idk-why">Now lets use search and route params in our components!</h4>
<style>
  .idk-why {
    margin-bottom: 40px;
  }
</style>
```
