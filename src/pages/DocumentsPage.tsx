import { useCallback, useState } from "react";
import {
  fetchCareExportMarkdown,
  getSessionIdentity,
} from "../foundation/careClient";
import {
  parseMarkdownToBlocks,
  renderDocumentBlocks,
  sanitizeExportMarkdown,
} from "../lib/documentRender";
import { loadActiveCareRecipientId, resolveCareSpace } from "../lib/careContext";
import { formatCareDateTime } from "../lib/humanCopy";

/**
 * Documents are generated from current care truth (export).
 * UI renders rich structure — never raw markdown syntax.
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
  const [docTitle, setDocTitle] = useState("");
  const [docBody, setDocBody] = useState("");
  const [proposals, setProposals] = useState<
    Array<{ id: string; title: string; kind: string; confidence: string }>
  >([]);
  const [docNote, setDocNote] = useState<string | null>(null);
  const session = getSessionIdentity();
  const space = resolveCareSpace(loadActiveCareRecipientId());

  async function ingestDocument() {
    setBusy(true);
    setError(null);
    setDocNote(null);
    try {
      const raw = sessionStorage.getItem("cr_care_session_v1");
      const token = raw
        ? (JSON.parse(raw) as { token?: string }).token
        : undefined;
      if (!token) {
        setError("Not signed in");
        setBusy(false);
        return;
      }
      const { getCareApiBaseUrl } = await import("../foundation/careHttpClient");
      const base = getCareApiBaseUrl();
      const res = await fetch(
        `${base}/api/v1/care/recipients/${encodeURIComponent(space.careRecipientId)}/documents`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: docTitle || "Care document",
            body: docBody,
          }),
        },
      );
      const json = (await res.json()) as {
        ok?: boolean;
        message?: string;
        proposals?: Array<{
          id: string;
          title: string;
          kind: string;
          confidence: string;
        }>;
        note?: string;
      };
      if (!res.ok || !json.ok) {
        setError(json.message ?? `HTTP ${res.status}`);
      } else {
        setProposals(json.proposals ?? []);
        setDocNote(
          json.note ??
            "Original preserved. Proposals need confirmation before becoming care truth.",
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    }
    setBusy(false);
  }

  async function confirmProposal(proposalId: string, decision: "confirm" | "reject") {
    setBusy(true);
    try {
      const raw = sessionStorage.getItem("cr_care_session_v1");
      const token = raw
        ? (JSON.parse(raw) as { token?: string }).token
        : undefined;
      if (!token) return;
      const { getCareApiBaseUrl } = await import("../foundation/careHttpClient");
      const base = getCareApiBaseUrl();
      const res = await fetch(
        `${base}/api/v1/care/recipients/${encodeURIComponent(space.careRecipientId)}/documents/proposals/${encodeURIComponent(proposalId)}`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ decision }),
        },
      );
      const json = (await res.json()) as { ok?: boolean; result?: string; message?: string };
      if (json.ok) {
        setDocNote(json.result ?? "Updated");
        setProposals((p) => p.filter((x) => x.id !== proposalId));
      } else {
        setError(json.message ?? "Confirm failed");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Confirm failed");
    }
    setBusy(false);
  }

  const generate = useCallback(async () => {
    setBusy(true);
    setError(null);
    const res = await fetchCareExportMarkdown();
    setBusy(false);
    if (!res.ok) {
      setMarkdown(null);
      setMeta(null);
      setError(res.message ?? "Could not prepare the document.");
      return;
    }
    setMarkdown(sanitizeExportMarkdown(res.markdown));
    setMeta({
      exportedAt: res.exportedAt,
      evidenceMode: res.evidenceMode,
      source: res.source,
    });
  }, []);

  const blocks = markdown ? parseMarkdownToBlocks(markdown) : [];

  return (
    <>
      <div className="greeting" data-testid="page-purpose-documents">
        <h1>Documents</h1>
        <p className="for-person">
          Prepared from {space.displayName}&apos;s current care context
        </p>
        <p className="muted section-lead" style={{ marginTop: 8, maxWidth: 560 }}>
          What source records exist and what awaits review. Proposed facts never
          become care truth until you confirm. You stay responsible for what is shared.
        </p>
      </div>

      <section
        className="section surface-known"
        data-testid="document-ingest-panel"
        aria-label="Add care document text"
      >
        <h2>Add document text</h2>
        <p className="muted section-lead">
          Paste letter or note text. Original is preserved. Extracted actions are
          proposals only until you confirm — never auto-applied as care truth.
        </p>
        <input
          type="text"
          data-testid="document-title"
          placeholder="Document title"
          value={docTitle}
          onChange={(e) => setDocTitle(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <textarea
          data-testid="document-body"
          placeholder="Paste therapy note, appointment letter, or medication instruction…"
          value={docBody}
          onChange={(e) => setDocBody(e.target.value)}
          rows={5}
          style={{ width: "100%" }}
        />
        <button
          type="button"
          className="primary-btn"
          data-testid="document-ingest-submit"
          disabled={busy || docBody.trim().length < 8}
          onClick={() => void ingestDocument()}
          style={{ marginTop: 8 }}
        >
          Extract proposed actions
        </button>
        {docNote && (
          <p className="muted" data-testid="document-ingest-note">
            {docNote}
          </p>
        )}
        {proposals.length > 0 && (
          <ul className="list-plain" data-testid="document-proposals">
            {proposals.map((p) => (
              <li key={p.id}>
                <strong>{p.title}</strong>{" "}
                <span className="muted">
                  · {p.kind} · {p.confidence}
                </span>
                <div className="btn-row" style={{ marginTop: 4 }}>
                  <button
                    type="button"
                    className="primary-btn"
                    data-testid={`proposal-confirm-${p.id}`}
                    disabled={busy}
                    onClick={() => void confirmProposal(p.id, "confirm")}
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    className="secondary-btn"
                    data-testid={`proposal-reject-${p.id}`}
                    disabled={busy}
                    onClick={() => void confirmProposal(p.id, "reject")}
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {space.depth === "lightweight" && (
        <section
          className="section surface-reported"
          aria-label="Recipient onboarding"
          data-testid="care-packet-request"
        >
          <h2>Initial care context</h2>
          <p className="muted">
            {space.displayName}&apos;s space is a lightweight demo context. Relay
            does not silently pull a live EHR chart. An authorized personal
            representative may request a provider care summary (packet) so the
            care team can map verified source material into this recipient
            context.
          </p>
          <button
            type="button"
            className="secondary-btn"
            data-testid="request-care-packet"
            onClick={() => {
              setError(null);
              setMeta({
                exportedAt: new Date().toISOString(),
                evidenceMode: "LAB_REQUEST",
                source: "provider_care_packet_request",
              });
              setMarkdown(
                `# Care packet request — ${space.displayName}\n\n` +
                  `Requested by: ${session.displayName}\n` +
                  `Status: Request prepared (lab) — not a live clinic transmission.\n\n` +
                  `Requested items (authorized source material):\n` +
                  `• Active problems / conditions\n` +
                  `• Current medications and allergies\n` +
                  `• Primary provider contact\n` +
                  `• Recent visit summary if available\n\n` +
                  `Next step: authorized provider organization supplies the packet; Relay maps it into recipient profile and care truth with provenance.`,
              );
            }}
          >
            Prepare provider care-packet request
          </button>
        </section>
      )}

      <section className="section" aria-label="Generate from care truth">
        <h2>Care summary</h2>
        <p className="muted">
          Built from live care truth for {space.displayName}, prepared as{" "}
          {session.displayName}.
        </p>
        {!markdown && !error && (
          <p className="muted cr-empty" data-testid="documents-empty-state">
            No document prepared yet for {space.displayName}. Generate a care
            summary from current care truth when you are ready — empty is honest,
            not broken.
          </p>
        )}
        <div className="btn-row">
          <button
            type="button"
            className="primary-btn btn-with-icon"
            data-testid="generate-care-export"
            data-action-kind="primary"
            disabled={busy}
            onClick={() => void generate()}
          >
            <span className="btn-glyph" aria-hidden>
              ☰
            </span>
            {busy ? "Preparing…" : "Prepare care summary"}
          </button>
        </div>
        {error && (
          <p className="attention-limit" role="alert" style={{ marginTop: 12 }}>
            {error}
          </p>
        )}
      </section>

      {markdown && (
        <section
          className="section surface-reported cr-doc-panel"
          aria-label="Generated document"
          data-testid="document-export-result"
        >
          <header className="cr-doc-header">
            <p className="cr-doc-kicker">Care document</p>
            <h2 className="cr-doc-title">Daily care summary</h2>
            <p className="muted">
              For {space.displayName} · prepared by {session.displayName}
              {meta?.exportedAt
                ? ` · ${formatCareDateTime(String(meta.exportedAt))}`
                : ""}
            </p>
            <p className="attention-limit" role="status">
              Readable care summary, not a clinical order or certified assessment.
              Review before any external share.
            </p>
          </header>

          {renderDocumentBlocks(blocks)}

          <div className="btn-row" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="secondary-btn btn-with-icon"
              data-action-kind="secondary"
              disabled
              title="External share is not enabled in this build"
            >
              <span className="btn-glyph" aria-hidden>
                ↗
              </span>
              Share (not enabled)
            </button>
            <button
              type="button"
              className="btn-danger btn-with-icon"
              data-action-kind="destructive"
              onClick={() => {
                setMarkdown(null);
                setMeta(null);
              }}
            >
              <span className="btn-glyph" aria-hidden>
                ×
              </span>
              Clear
            </button>
          </div>
        </section>
      )}
    </>
  );
}
