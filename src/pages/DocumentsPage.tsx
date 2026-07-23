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

  return (
    <>
      <div className="greeting">
        <h1>Documents</h1>
        <p className="for-person">
          Prepared from {careRecipient.displayName}&apos;s current care context
        </p>
        <p className="muted" style={{ marginTop: 8, maxWidth: 560 }}>
          Documentation is caregiver work. Relay can structure clarity from{" "}
          <strong>live care truth</strong> — humans remain responsible for what
          is shared.
        </p>
      </div>

      <section className="section surface-verify" aria-label="Document safety">
        <h2>Safety model</h2>
        <ul className="list-plain">
          <li>
            <strong>Readable</strong> — AI/export may structure caregiver and
            system records for another human.
          </li>
          <li>
            <strong>Not authoritative</strong> — this is not a clinical order,
            diagnosis, or certified assessment.
          </li>
          <li>
            <strong>Human gate</strong> — external share is not automatic in
            this build.
          </li>
        </ul>
      </section>

      <section className="section" aria-label="Generate from care truth">
        <h2>Generate from current care truth</h2>
        <p className="muted">
          Calls the care export endpoint for {careRecipient.displayName} as{" "}
          {session.displayName}. No hard-coded document body.
        </p>
        <div className="btn-row">
          <button
            type="button"
            className="primary-btn"
            data-testid="generate-care-export"
            disabled={busy}
            onClick={() => void generate()}
          >
            {busy ? "Generating…" : "Generate care summary"}
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
          className="section surface-reported"
          aria-label="Generated export"
          data-testid="document-export-result"
        >
          <h2
            style={{
              textTransform: "none",
              letterSpacing: "-0.02em",
              fontSize: "1.1rem",
              color: "var(--cr-graphite)",
            }}
          >
            Care summary export
          </h2>
          <p className="muted">
            {meta?.exportedAt
              ? `Exported ${new Date(meta.exportedAt).toLocaleString()}`
              : "Exported"}
            {meta?.source ? ` · ${meta.source}` : ""}
            {meta?.evidenceMode ? ` · ${meta.evidenceMode}` : ""}
          </p>
          <p className="attention-limit" role="status">
            Readable continuity / export — not professionally authoritative.
            Review before any external share.
          </p>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              fontFamily: "var(--cr-font)",
              fontSize: "0.9rem",
              background: "var(--cr-clinical)",
              padding: 14,
              borderRadius: 12,
              border: "1px solid var(--cr-border-soft)",
              marginTop: 12,
              maxHeight: 420,
              overflow: "auto",
            }}
          >
            {markdown}
          </pre>
          <div className="btn-row">
            <button
              type="button"
              className="secondary-btn"
              disabled
              title="External share requires a dedicated share pipeline not enabled in this build"
            >
              Share (not enabled)
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                setMarkdown(null);
                setMeta(null);
              }}
            >
              Clear
            </button>
          </div>
        </section>
      )}
    </>
  );
}
