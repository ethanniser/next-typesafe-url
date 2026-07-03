---
"next-typesafe-url": minor
---

Add Next.js 16 support

- Widen the `next` peer dependency range to include `^16.0.0`
- Build against React 19 types: `JSX` is now imported from `"react"` (`React.JSX`) instead of the removed global namespace, and `useRef` is called with an explicit initial value
- Upgrade the `appdir` and `pagesdir` example apps to Next 16 (Turbopack, `cacheComponents`) to verify both routers against the new version
