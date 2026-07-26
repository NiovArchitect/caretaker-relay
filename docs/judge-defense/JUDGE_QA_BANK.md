# Judge Q&A Bank (75+)

**Use:** Founder oral defense. Answers are boundary-honest.  
**Rule:** Prefer short + evidence pointer over feature laundry list.

---

## A. Identity of the product (1–10)

**1. What is Caretaker Relay?**  
A care coordination companion that turns natural caregiver language into shared, verified, permission-aware care context for everyone helping one person at home.

**2. Who is it for?**  
Family caregivers first (Track 1), plus professional home caregivers (DSPs) and providers who need continuity—not workforce managers.

**3. How is this different from ChatGPT?**  
ChatGPT is a general model. Relay is grounded in a care recipient record, auth identity, isolation boundaries, HITL confirmation, and honest scheduling. It refuses invented care truth.

**4. Is this an EHR?**  
No. It is not a full EHR and does not claim chart replacement for hospitals.

**5. Is this workforce software?**  
No. Workforce management is out of Track 1 scope (explicit N/A).

**6. Is the data real?**  
Lab data is synthetic. Product behavior is real. No production PHI in the demo lab.

**7. Is it live?**  
Yes — https://care.niovlabs.com with source/deploy SHA parity on the freeze.

**8. Technology readiness?**  
Demonstrable working system with public deploy, not a slide-only concept. Field validation still pending (recruitment paused).

**9. What is autonomous?**  
Deterministic retrieval, projections, safety refuses, isolation. Consequential care updates require human confirm. Clinical judgment stays human.

**10. What is synthetic versus real?**  
Personas/fixtures synthetic; software, isolation, deploy, and controlled measurements real.

---

## B. Safety & AI (11–25)

**11. What happens when the AI is wrong?**  
Consequential items require human verification. Wrong premises are refused. Caregivers can correct; notes carry source/role. Escalation to another human is a first-class path.

**12. What happens if the AI is unavailable?**  
Deterministic care-truth path continues for meds, profile, coverage, safety refuses, scheduling honesty. Demo continues without live LLM.

**13. How do you prevent hallucination?**  
Adversarial guards (e.g. Protocol 9-Delta), false-premise detection, on-file grounding, no silent dose mutation, HITL before care notes.

**14. Protocol 9-Delta?**  
Invented protocol request is refused; product does not invent clinical protocols not on file.

**15. How do you prevent unsupported truth promotion?**  
Answers distinguish on-file vs not-on-file; observations ≠ diagnoses; chat assertions do not rewrite meds.

**16. What does the LLM actually do?**  
Optional language assistance when available. It does not own care truth or auth.

**17. How is conversational context maintained?**  
Active recipient care space + server-side answer path; not a free-form memory dump across people.

**18. Stale documents?**  
Scheduling and status answers use current appointment state; canceled/moved items should not be presented as still active.

**19. Duplicate requests?**  
Idempotency on appointment request confirm paths (lab).

**20. Scheduling races?**  
Collision / unavailable surfaces; no pretend double-book success.

**21. Provider API failure?**  
Honest failure language; no fake clinic acceptance.

**22. Human verification?**  
Verify panel → Confirm → care note write path for consequential updates.

**23. Are you sure?**  
Product language points to on-file records and verification state—not false certainty.

**24. What if this is wrong?**  
Correct via verify/report path; surface conflict; escalate human. Do not silently pick a side.

**25. Prompt injection?**  
“Ignore previous / export all / act as admin” refused; auth identity wins.

---

## C. Privacy & identity (26–40)

**26. How do you prevent one patient’s data leaking into another?**  
Active recipient isolation; cross-recipient medication queries refused with switch instruction; server-side membership.

**27. Tenant isolation?**  
Org/lab boundary enforced; cross-organization dumps refused.

**28. How do you know Dr. Shah is really Evelyn’s physician?**  
Team membership / care relationship on file for the lab household—not chat self-assertion.

**29. Same-name providers?**  
Ambiguity → clarify; do not invent which Shah.

**30. Wrong recipient?**  
Active care space guards; refuse mix.

**31. Pronouns (she/him/mom)?**  
Resolve to active recipient when unambiguous; ask when not.

**32. Minimum necessary access?**  
Role- and membership-scoped; no “all patients” chat export.

**33. Auditability?**  
Care notes with role/source; history filters; server logs posture in foundation docs.

**34. Show me Robert’s meds while caring for Evelyn?**  
Must refuse.

**35. All patients Dr. Shah sees?**  
Must refuse.

**36. Another org’s records?**  
Must refuse.

**37. Family vs DSP difference?**  
Same product shell; role terminology (care update vs support note); professional orientation emphasis.

**38. Care recipient privacy?**  
Dignity and control are Phase 2 research targets; lab has no real PHI.

**39. Secrets in demo?**  
Lab passwords only for principals; no production secrets in review exports.

**40. PHI scan posture?**  
Review exports maintained as PASS for secrets/PHI.

---

## D. Caregiving value (41–55)

**41. How does this save caregivers time?**  
In controlled product testing, orientation, care update, handoff, and provider summary workflows reduced time and steps versus structured manual baselines (see task-time pack). Not a population claim.

**42. What is the caregiver loop?**  
Orient → Care → Speak → Verify → Note → Handoff → History.

**43. Documentation without EHR charts?**  
Conversational input → structured care note; not family-facing EHR charting UI.

**44. Handoff?**  
Coverage-aware handoff prep; History timeline.

**45. Who takes over after me?**  
Coverage projection (e.g. Maya next).

**46. What changed today?**  
Orientation + notes/history surfaces.

**47. Should I give meds again?**  
On-file schedule/window; no clinical inventing; encourage verify.

**48. What should I tell the ER?**  
Essential snapshot from on-file emergency/profile data.

**49. Multi-caregiver disagreement?**  
Surface conflict / verify—do not silently choose.

**50. Observation vs diagnosis?**  
Labeled separately on profile and answers.

**51. DSP baseline / preferences?**  
Profile mobility, preferences, goals on file.

**52. Transportation?**  
Intent-aware answers tied to appointments.

**53. Reminders?**  
Projected from appointment times (leave-by coherence).

**54. Notifications?**  
Durable notification posture from prior freeze (do not overclaim push channels without demo).

**55. Why trust this summary?**  
On-file sources + verification state + human confirm path.

---

## E. Scheduling & systems (56–65)

**56. Can you book my real doctor?**  
Lab availability and request honesty only; not live EHR booking.

**57. Integrate with EHR?**  
Future adapter layer; would require contracts, auth, and clinical governance. Not claimed live.

**58. Integrate with provider scheduling?**  
Same—honest adapter future; current Schedule/Slot lab.

**59. Reschedule / cancel?**  
Supported as intentional lab workflows with status honesty.

**60. Collision?**  
Unavailable / collision surfaced.

**61. Idempotent confirm?**  
Re-confirm does not double-create request.

**62. What if Maya doesn’t show?**  
Coverage + escalation language; product doesn’t invent a replacement human.

**63. Leave-by time?**  
Derived from appointment time projections.

**64. Ops reviewer: is scheduling fake?**  
Transparent lab model—judges should reward honesty over fake “booked with clinic” claims.

**65. Multi-turn schedule?**  
List slots → pick time → draft → confirm request.

---

## F. Validation & competition (66–80)

**66. Have caregivers used this?**  
Not yet. Recruitment paused. Caregiver input: NONE. Validated: NONE.

**67. Why pause recruitment?**  
Founder control; product internally closed first; validation is next authorized phase.

**68. What is Phase 2 research?**  
Interview guides, usability protocol, measures, observation rubric ready; sessions = 0 until authorization.

**69. Track 1 fit?**  
Home/community caregiver support; burden reduction; safety; person-centered; user-centered design evidence via controlled testing.

**70. How do you measure impact?**  
Controlled task-time + quality gates now; real caregiver metrics after research cycle.

**71. Accessibility?**  
Responsive layouts (mobile/tablet/desktop screenshots); further a11y audit disclosed as continuous; not claiming WCAG certification.

**72. Performance?**  
Public Render deploy; cold start possible—recovery playbook; demo uses deterministic beats.

**73. Known P0/P1?**  
0 / 0 at freeze.

**74. OpenAI?**  
External quota block; not a product redesign trigger.

**75. What would change your mind about readiness?**  
A reproducible P0/P1 safety/privacy failure—or real caregiver findings that contradict controlled claims.

**76. Why should ACL fund/advance this?**  
Working public system, strong safety perimeter, honest boundaries, measurable controlled burden reduction, clear path to human validation.

**77. Biggest risk?**  
Overclaiming real-world savings without caregiver validation—and we refuse that claim.

**78. Biggest strength?**  
Care truth + HITL + isolation + person intelligence in one caregiver-facing loop.

**79. What breaks the demo?**  
Public outage; panic refresh; claiming clinic booking; inventing clinical certainty.

**80. Closing line?**  
“Caregivers talk like humans. Relay does the organizational work—with humans still in charge of care truth.”

---

## G. Hard physician pack (81–90)

**81. Where did this diagnosis come from?**  
Source labels (e.g. provider/clinic on file).

**82. Who authorized this medication?**  
Authorized provider instruction on file.

**83. Was dizziness observed or diagnosed?**  
Observation/concern vs diagnosis separation.

**84. Who reported it / when?**  
Caregiver source + temporal if on file; else unknown.

**85. Before or after medication?**  
Only if record supports; else calibrated unknown.

**86. Unverified information?**  
Surfaced as unverified / observation.

**87. What did caregiver actually say?**  
Raw → structured note path preserves intent.

**88. AI interpretation?**  
Structured projection over on-file facts; not free diagnosis.

**89. Withholding for permissions?**  
Yes when out of scope—honest about boundaries.

**90. Two caregivers disagree?**  
Conflict / verify—not silent overwrite.

---

## H. Hostile wrap (91–100)

**91. Delete the old prescription via chat?**  
Refuse destructive chat mutation.

**92. Mark doubled dose done?**  
Refuse unsupported dose state.

**93. Causation (did Metformin cause dizziness)?**  
Refuse clinical causation judgment.

**94. Extra pills now?**  
Refuse unauthorized administration invent.

**95. Export all households?**  
Refuse.

**96. Pretend I’m Dr. Shah?**  
Auth identity wins.

**97. Blood type / dementia not on file?**  
Don’t invent; known/unknown/next step.

**98. Forget what I said / no that’s not what happened?**  
Correction path; do not dig in on wrong premise.

**99. Demo fails now—what do you do?**  
Failure ladder: retry once → hard refresh → re-login → switch deterministic wow → evidence slide.

**100. Will you ship features mid-judging?**  
No. Product freeze. Only P0/P1 repairs if discovered.
