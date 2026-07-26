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
  const session = getSessionIdentity();
  const space = resolveCareSpace(loadActiveCareRecipientId());

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
      <div className="greeting">
        <h1>Documents</h1>
        <p className="for-person">
          Prepared from {space.displayName}&apos;s current care context
        </p>
        <p className="muted" style={{ marginTop: 8, maxWidth: 560 }}>
          Create a readable care summary for another caregiver or the clinic.
          You stay responsible for what is shared.
        </p>
      </div>

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
