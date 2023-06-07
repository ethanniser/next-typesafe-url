---
"next-typesafe-url": major
---

- major changes
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
