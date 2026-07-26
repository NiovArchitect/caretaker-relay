# Vendor and BAA Inventory (Complete as of 2026-07-26)

| Vendor | Use | PHI possible | BAA available | Executed BAA evidence | Next action |
|--------|-----|--------------|---------------|----------------------|-------------|
| Render | Host app + care API | Logs may include metadata | Platform DPA path | **Not evidenced** | Legal review |
| Postgres host (DATABASE_URL) | Care* durable rows | Yes | Host-dependent | **Not evidenced** | Confirm host + BAA |
| Prisma | ORM | N/A (library) | N/A | N/A | — |
| Anthropic | LLM understand | Care text | Vendor-dependent | **No** | Execute BAA before regulated PHI |
| OpenAI | Optional LLM | Care text | Vendor-dependent | **No** | Same |
| ElevenLabs | STT (if configured) | Voice | Vendor-dependent | **No** | Inventory production use |
| GitHub | Source/CI | No PHI | N/A | N/A | — |
| Email/SMS | Verification delivery | Contact | Future | **Not integrated** | Select vendor + BAA |
| Redis/Valkey | Nonce (foundation) | Session meta | Host-dependent | Partial | Confirm care deploy |
| Cloudflare | Unknown/CDN | Possible | Case-by-case | Unknown | Confirm if fronting |
| Analytics | Prefer none | — | — | — | Keep disabled for PHI |
| Object storage | Not primary care | — | — | — | Document if added |
| Backups | DB backups | Yes | Via host | **Not evidenced** | Ops policy |
| Support tools | Ops | Possible | — | — | Least privilege |

**Rule:** `CARE_AI_REQUIRE_BAA=1` blocks live model calls without `CARE_AI_BAA_EXECUTED` + `CARE_AI_PHI_ALLOWED`.
