---
"next-typesafe-url": major
---

Add support for Next.js 15, which makes accessing search and route params from page components and layouts async

This change required moving the parsing logic from the HOC component, and before your page component ever gets called, to when you `await`/`.then` the searchParams/routeParams promise. This means that those promises will now reject when validation fails, but this also allows more fine grained error handling.
