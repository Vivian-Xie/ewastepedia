"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function WikiEditPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [component, setComponent] = useState<{ id: string; name: string } | null>(null);
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/components/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setComponent({ id: data.id, name: data.name });
        setContent(data.wikiPage?.content ?? "");
      });
  }, [slug]);

  async function save() {
    if (!component || !content.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch("/api/wiki", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        componentId: component.id,
        content,
        authorId: "seed-admin",
        summary,
      }),
    });
    if (res.ok) {
      router.push(`/wiki/${slug}`);
    } else {
      setError("Failed to save. Please try again.");
      setSaving(false);
    }
  }

  if (!component) {
    return (
      <div className="page" style={{ textAlign: "center", paddingTop: 80, color: "var(--text-meta)" }}>
        Loading…
      </div>
    );
  }

  return (
    <div className="page">
      <div className="breadcrumb">
        <a href="/">Home</a>
        <span>›</span>
        <a href={`/wiki/${slug}`}>{component.name}</a>
        <span>›</span>
        Edit
      </div>

      <h1 style={{ fontFamily: "'Linux Libertine O', Georgia, serif", fontSize: "1.6rem",
        fontWeight: 400, marginBottom: 20 }}>
        Editing: {component.name}
      </h1>

      {error && <div className="alert error">{error}</div>}

      <div className="form-group">
        <label className="form-label">Wiki Content (Markdown)</label>
        <textarea
          className="form-input"
          style={{ minHeight: 500, fontFamily: "JetBrains Mono, monospace", fontSize: "0.82rem",
            lineHeight: 1.6 }}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="## Overview&#10;&#10;Write about this component..."
        />
      </div>

      <div className="form-group">
        <label className="form-label">Edit Summary (optional)</label>
        <input
          className="form-input"
          type="text"
          placeholder="e.g. Added wiring diagram section"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save Wiki Page"}
        </button>
        <a className="btn-ghost" href={`/wiki/${slug}`}
          style={{ display: "inline-flex", alignItems: "center", padding: "7px 14px",
            border: "1px solid var(--border)", borderRadius: 3, fontFamily: "JetBrains Mono, monospace",
            fontSize: "0.68rem", color: "var(--text-meta)", letterSpacing: "0.04em",
            textDecoration: "none" }}>
          Cancel
        </a>
      </div>

      <div style={{ marginTop: 32, padding: 16, background: "var(--bg-sidebar)",
        border: "1px solid var(--border)", borderRadius: 4 }}>
        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.62rem",
          color: "var(--text-meta)", marginBottom: 8 }}>
          MARKDOWN REFERENCE
        </div>
        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.72rem",
          color: "var(--text-secondary)", lineHeight: 1.8 }}>
          ## Heading 2 &nbsp;&nbsp; ### Heading 3<br />
          **bold** &nbsp;&nbsp; `inline code`<br />
          - list item<br />
          ```code block```
        </div>
      </div>
    </div>
  );
}
