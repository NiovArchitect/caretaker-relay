# RELAY FALSE-PREMISE UI TIMING DIAGNOSIS

Generated: 2026-07-24  
Mode: zero-miss internal freeze closure

## Failing gate

Button audit case: `relay_false_premise_ui`  
Prompt: `Evelyn takes insulin, right?`  
Prior result: 19/20 (this case FAIL)

## Reproduction (public API)

12 consecutive `POST /api/v1/care/answer` runs (pre-fix deploy):

| metric | ms |
|--------|-----|
| min | 9529 |
| p50 | 10444 |
| p90 | 11059 |
| max | 12986 |
| mean | 10452 |

Answer content **always correct** on every run:

> I don't have insulin on Evelyn Carter's current medication schedule…

Server response correctness: 12/12 PASS  
Product latency: ~10s (blocking full-store Prisma flush after every answer)

## Audit harness (old)

```js
await page.getByTestId("composer-send").click();
await page.waitForTimeout(3500); // first med Q
// immediately second Q
await page.getByTestId("composer-send").click();
await page.waitForTimeout(3500); // false premise
```

## Root cause classification

**Primary: G SERVER LATENCY + A TEST WINDOW TOO SHORT + busy-path drop**

| class | applies? | notes |
|-------|----------|-------|
| A TEST WINDOW TOO SHORT | YES | fixed 3500ms vs ~10s answer TTFB |
| B POLLING DELAY | NO | no poll for answer path |
| C RENDER RACE | PARTIAL | sequential asks without waiting for first render |
| D STALE REACT STATE | NO | |
| E ACTIVE-RECIPIENT RACE | NO | |
| F CONVERSATION-PERSISTENCE DELAY | PARTIAL | persistTurn + full flush |
| G SERVER LATENCY | YES | `await runtime.flush()` full snapshot on CARE_ANSWER |
| H RETRY/BACKOFF | NO | |
| I EVENTUAL-CONSISTENCY | NO | |
| J REAL USER-FACING DELAY | YES | ~10s answer is judge-visible |
| K OTHER | YES | `submitText` drops input while `busy`; Send was not disabled |

## Product fixes (minimal)

1. **Answer route**: flush async after CARE_ANSWER response (care truth write paths still await flush).
2. **Composer**: disable Send while `busy`; label "Working…".
3. **RelayPanel**: pass `busy` into Composer.
4. **Button audit**: content-based wait (`waitForFunction` on thread text) up to 20s; wait for Send re-enabled between turns.
5. **Named regression**: `relay_false_premise_ui_regression` in unit + audit.

## Expected post-fix

- API insulin answer content unchanged
- TTFB should drop to network + CPU (no multi-second flush wait on critical path)
- Button audit waits for match, not a fixed sleep
- 20/20 content-based audit

## What we did NOT do

- Did not redesign Relay architecture
- Did not lower assertion regexes
- Did not extend timeout blindly without content wait
