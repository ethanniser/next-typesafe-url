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

`$path` can throw at runtime if passed non-serializable values (functions, symbols, bigints) to any of the route or search params.

_This should never happen if you are not ignoring the many typescript errors that would be thrown at you._

---

**Note:** Explicitly passing `undefined` in searchParams or routeParams

If `undefined` is explictly passed as a **route param** it behaves the same as if that key was not listed at all: essentially ignored (only possibly used for optional catch all routes)

If `undefined` is explictly passed as a **search param**, it will be passed to the url without a corresponding value. This is different from leaving it out entirely, which will not include the search param in the url at all.

---

<h4 class="idk-why">Now lets use search and route params in our components!</h4>
<style>
  .idk-why {
    margin-bottom: 40px;
  }
</style>
