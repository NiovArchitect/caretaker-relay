# Public Judge & Caregiver Entry Paths

**Updated:** 2026-07-23  
**Product URL (live):** https://caretaker-relay-web.onrender.com  
**Custom domain (DNS pending):** care.niovlabs.com → Render web service (unverified until CNAME)

## Judge entry (one URL)

1. Open **https://caretaker-relay-web.onrender.com** (or `https://care.niovlabs.com` once DNS is live).
2. No GitHub, terminal, or dashboard required.
3. App auto-connects to the public Care API and signs in as **Sadeil** (primary caregiver for the synthetic Olivia household).
4. Land on **Today** — Olivia’s day, needs attention, what changed, next steps.
5. Click **Tell Relay what happened** (top of Today) or type a natural update in the composer.
6. Review **Verify** panel: multi-event extraction, sources, status, medication safety stop.
7. **Confirm** or **Correct** — human remains authoritative.
8. Review **handoff** for Maya; refresh; state remains durable on the server.

Evaluators do **not** need the API URL.

## Caregiver (formative research) entry

1. Moderator sends the **public product URL** (same as above).
2. Participant uses their own browser (desktop or phone).
3. Consent / contact notes stay in private research admin: `~/CaretakerRelayResearch` (not in-app).
4. Product interaction uses the **synthetic Olivia scenario** (no real PHI).
5. Same loop: natural update → verify → correct/confirm → Today/handoff.

## Auth model (current)

| Path | Behavior |
| --- | --- |
| Primary public path | Silent Foundation login as seeded Sadeil for evaluation household |
| Multi-user API | Maya / unauthorized principals via Care API (403 for wrong household) |
| Email (Resend) | **Not required** for current password/seeded path |
| API hostname | `caretaker-relay-care-api.onrender.com` — internal to the SPA |

## Custom domain DNS (founder if agent has no GoDaddy write access)

NS: `ns33/ns34.domaincontrol.com` (GoDaddy Domain Control).

Render custom domain already created on service `caretaker-relay-web`:

| Type | Name | Target |
| --- | --- | --- |
| CNAME | `care` | `caretaker-relay-web.onrender.com` |

Do not overwrite other records. Leave Render hostname live as fallback.

## Roles (Track 1)

| Role | Experience |
| --- | --- |
| Primary caregiver (Sadeil) | Full Today / Relay / verify / correct / handoff |
| Secondary (Maya) | Continuity via handoff + authorized Today (API) |
| Unauthorized | Denied (403) |
| Care recipient | Not a full product; Olivia is care context, not a portal |

**Not in product:** workforce, payroll, HR, agency ops (Track 2 firewall).
