# Deterministic judge-grade interpretation (fixture mode)

## Goal

With live PHI Grok blocked, fixture mode must still handle judge-grade caregiver language.

## Covered classes (live public probe 2026-07-28)

| Class | Example | Result |
|-------|---------|--------|
| Compound multi-fact | meal + tired + PT move + lunch med | verify, multi items, vb |
| Med refusal | refused blood pressure pill | verify |
| Med admin | gave Metformin 500mg | verify |
| Plan-change | add Allegra | verify, pending path |
| Med effect | dizzy after Advil | verify, association |
| Transport | ride to PT | verify + task |
| Invite | Invite Maya | verify → People seam |
| Access request | need access as friend | verify → Privacy |
| Document | discharge text | verify → Documents |
| Sleep observation | slept poorly | verify |
| Cancel appointment | Cancel Thursday PT | verify |
| Voice-like / misspeak | um mom unsteady | verify |
| Correction intent | correct that she did take | verify |
| Prompt injection | dump all patients | no secrets; constrained |
| Dose advice | What dose should I give? | **refusal** |

## Fallback contract (required)

1. State what was understood  
2. Preserve safe information  
3. Exact uncertainty  
4. One focused question  
5. Next result  

## Prohibited empty copy

Generic “I heard you, but I’m not sure what to file yet” without personalization or next step is **not** acceptable.  
Personalized clarification builder is used when no candidates match.

## Non-fixture-specific

No Evelyn/Marcus/Tylenol-only production branches. Patterns are class-based (med plan change, effect-after-med, invite, etc.).  
