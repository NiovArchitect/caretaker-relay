# Questionable Flow Source Excerpts

GENERATED_AT: 2026-07-23T17:10:05Z
Classification based on source inspection for REAL PRODUCT RECONSTRUCTION state (HEAD at export).

## A. Lab auto-login (PARTIAL / SCRIPTED entry)
FILE: src/foundation/careClient.ts
CLASS: PARTIAL — intentional lab seed entry, not multi-user product auth UX
```
36:  careLabLogin,
125:let sessionIdentity: SessionIdentity | null = null;
159:  sessionIdentity = null;
164:    sessionIdentity ?? {
202:async function ensureHttpSession(): Promise<boolean> {
214:  const login = await careLabLogin(people.sadeil.id, "sadeil-lab-password");
221:  sessionIdentity = {
235:  const useHttp = await ensureHttpSession();
429:  const useHttp = await ensureHttpSession();
490:  const useHttp = await ensureHttpSession();
568:  const useHttp = await ensureHttpSession();
609:  const useHttp = await ensureHttpSession();
649:  const useHttp = await ensureHttpSession();
```

## B. JUDGE_DEMO_UTTERANCE retained (TEST-ONLY if not bound to chrome)
FILE: src/foundation/careClient.ts
CLASS: PARTIAL risk — constant exists; product chrome should not call it
```
12-  createCareRuntime,
13-  runCanonicalCareLoop,
14-  sadeilContext,
15:  DEMO_UTTERANCE,
16:  JUDGE_LOOP_UTTERANCE,
17-  UNSAFE_PROTOCOL_UTTERANCE,
18-  careRecipient,
19-  people,
--
59-};
60-
61-export {
62:  DEMO_UTTERANCE,
63:  JUDGE_LOOP_UTTERANCE,
64-  UNSAFE_PROTOCOL_UTTERANCE,
65-  careRecipient,
66-  people,
--
71- * Evaluator-only sample utterance (tests / cold-start).
72- * Must NOT be bound to product chrome as a care workflow.
73- */
74:export const JUDGE_DEMO_UTTERANCE = JUDGE_LOOP_UTTERANCE;
75-
76-export type CareClientMode = "fixture" | "llm";
77-
--
361-  burden?: BurdenMetrics;
362-}> {
363-  const { service } = getCareRuntime();
364:  return runCanonicalCareLoop(service, DEMO_UTTERANCE, sadeilContext());
365-}
366-
367-export function getWhoCanSeeWhat() {
```
App.tsx references (should be none for product CTAs after reconstruction):
```
(no matches)
```

## C. Static handoff export (DEPRECATED / must not be UI-wired)
FILE: src/scenario/olivia.ts
CLASS: STATIC/TEST residue
```
196:export const handoff: CareHandoff = {
197-  id: "ho-test-only-unused",
198-  careRecipientId: careRecipient.id,
199-  fromPersonId: people.marcus.id,
200-  toPersonId: people.maya.id,
201-  whatChanged: [],
202-  stillNeedsAttention: [],
203-  watch: [],
204-  sources: [],
205-  createdAt: "2026-07-22T12:00:00Z",
206-  evidenceMode: "DEMO_ONLY",
207-};
208-
209-export const oracle = foundationOracle;
210-
211-export const DEMO_UTTERANCE = FOUNDATION_DEMO;
212-export const UNSAFE_PROTOCOL_UTTERANCE = FOUNDATION_UNSAFE;
```
HandoffPanel imports of demo handoff:
```
2:import { careRecipient, people } from "../scenario/olivia";
```

## D. Messages mode honest absence
FILE: src/components/RelayPanel.tsx
CLASS: ABSENT capability presented honestly (not fake threads)
```
153:        <div className="relay-thread" data-testid="human-messages">
154-          <div className="bubble bubble-system" data-testid="messages-not-available">
155:            Human messaging is <strong>not available</strong> in this build.
156-            {"\n\n"}
157-            There is no message thread model (sender, recipient, care recipient,
158-            body, status) wired end-to-end yet.
159-            {"\n\n"}
160-            For continuity today, use a <strong>real handoff</strong> derived
161-            from confirmed care truth for {careRecipient.displayName}.
162-            {"\n\n"}
163-            We will not show fake chats or fake delivery states.
164-          </div>
165-        </div>
166-      )}
167-    </aside>
168-  );
169-}
```

## E. Invitation honest absence
FILE: src/pages/PeoplePage.tsx
CLASS: ABSENT
```
90:        <h2>Invitations</h2>
91:        <p className="muted" data-testid="invite-not-available">
92-          Caregiver invitation lifecycle is{" "}
93-          <strong>not available in this build</strong>. No Invite button is
94-          shown until create → token → accept → membership is real end-to-end.
95-        </p>
96-      </section>
97-
98-      {selected && (
99-        <section
100-          className="section surface-reported"
101-          aria-label={`${selected.displayName} details`}
102-          data-testid="person-detail"
103-        >
```

## F. Documents export path (REAL path after reconstruction)
FILE: src/pages/DocumentsPage.tsx
CLASS: REAL generation via export (verify no SEED_DOCS)
```
4:  fetchCareExportMarkdown,
10: * not from hard-coded SEED_DOCS bodies.
26:    const res = await fetchCareExportMarkdown();
84:            data-testid="generate-care-export"
import { useCallback, useState } from "react";
import { careRecipient } from "../scenario/olivia";
import {
  fetchCareExportMarkdown,
  getSessionIdentity,
} from "../foundation/careClient";

/**
 * Documents must be generated from current care truth (export),
 * not from hard-coded SEED_DOCS bodies.
 */
export function DocumentsPage() {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    exportedAt?: string;
    evidenceMode?: string;
    source?: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const session = getSessionIdentity();

  const generate = useCallback(async () => {
    setBusy(true);
    setError(null);
    const res = await fetchCareExportMarkdown();
    setBusy(false);
    if (!res.ok) {
      setMarkdown(null);
      setMeta(null);
      setError(res.message ?? "Export failed.");
      return;
    }
    setMarkdown(res.markdown);
    setMeta({
      exportedAt: res.exportedAt,
      evidenceMode: res.evidenceMode,
      source: res.source,
    });
  }, []);
```

## G. Attention → Care (not prompt fill)
FILE: src/App.tsx onReviewAttention
```
357:  function onReviewAttention(item: TodayAttentionItem) {
358-    // Care objects open in Care — never inject a prewritten Relay prompt.
359-    if (item.kind === "medication") {
360-      setCareFocus("medication");
361-      setTab("care");
362-      return;
363-    }
364-    setCareFocus(item.kind === "task" ? "task" : "general");
365-    setTab("care");
366-  }
367-
368-  function onNavChange(t: NavTab) {
369-    setTab(t);
370-    if (t === "relay") openRelayForCareUpdate();
371-    if (t !== "care") setCareFocus(null);
372-  }
```

## H. openRelayForCareUpdate (empty composer)
```
130:  function openRelayForCareUpdate() {
131-    setDraft("");
132-    setVoiceMeta(undefined);
133-    setCorrecting(false);
134-    openRelay();
135-  }
136-
137-  async function openLatestHandoff() {
138-    setShowHandoff(true);
139-    setHandoffLoading(true);
140-    setLiveHandoff(undefined);
```

## I. Legacy RelayPage fill-judge (if still present — unused route risk)
```
5:  onUseDemo,
9:  onUseDemo: () => void;
52:          data-testid="fill-judge-update"
53:          onClick={onUseDemo}
```

## J. Fixture understand mode
FILE: src/foundation/careClient.ts resolveMode
CLASS: PARTIAL — lab fixture path not live LLM
```
127:function resolveMode(): CareClientMode {
128:  const env = import.meta.env?.VITE_CARE_MODE as string | undefined;
129-  if (env === "llm") return "llm";
130-  return "fixture";
131-}
132-
133-function transportPref(): "http" | "package" | "auto" {
134-  const t = import.meta.env?.VITE_CARE_TRANSPORT as string | undefined;
135-  if (t === "http" || t === "package") return t;
136-  // Vitest sets MODE=test — keep unit tests on in-process package path.
--
144:      mode: resolveMode(),
145-      seedOlivia: true,
146-    });
147-  }
148-  return runtime;
149-}
150-
151-export function resetCareRuntimeForTests() {
152-  runtime = null;
--
239:      mode: resolveMode(),
240-      transcriptMeta,
241-    });
242-    if (res.ok && res.data.kind === "refusal") {
243-      return {
244-        kind: "refusal",
245-        message: res.data.message ?? "Refused",
246-        evidenceMode: (res.data.evidence_mode as EvidenceMode) ?? "FIXTURE",
247-        auditIds: [],
```
