# FINAL PUBLIC BROWSER AND CI BASELINE

**At:** 2026-07-31  
**Controller:** Agent Zero  

## Live product

| Layer | SHA | Deploy |
|-------|-----|--------|
| App | `b4f64b6a3848f40e719d7f9331115622417f3e45` (+ claim-body repair pending deploy) | `dep-d9m18nu417fc73dpkmt0` live prior |
| Bundle | `index-BvraZTm4.js` | public |
| API | `340c546a0cd74f99c9022c576e88e786b6d05bc9` | `dep-d9m18noae00c73b840ag` live |

## Unit baseline (reconfirmed)

- Foundation care: **359 passed / 0 failed**
- App: **98 passed / 0 failed**

## Public browser harness

`node scripts/physician-public-browser-closure.mjs`

Multi-role login + identity strip + H&P + Why/Learn more + clinical 30 API + shift plan sample + claim attempt.
