"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const TAGS = ["DIY", "EDUCATION", "DOCS", "TEARDOWN", "COMMUNITY"];

function NewThreadForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultCategory = searchParams.get("category") ?? "";

  const [categories, setCategories] = useState<Array<{ id: string; slug: string; name: string }>>([]);
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        setCategories(data);
        if (defaultCategory) {
          const found = data.find((c: { slug: string }) => c.slug === defaultCategory);
          if (found) setCategoryId(found.id);
        }
      });
  }, [defaultCategory]);

  function toggleTag(t: string) {
    setTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  }

  async function submit() {
    if (!categoryId || !title.trim() || !content.trim()) {
      setError("Category, title, and content are required.");
      return;
    }
    setSaving(true);
    setError("");

    const anon = await fetch("/api/categories").then(() =>
      fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          authorId: "placeholder",
          title,
          content,
          tags,
        }),
      })
    );

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, authorId: "placeholder", title, content, tags }),
    });

    if (res.ok) {
      const post = await res.json();
      router.push(`/thread/${post.id}`);
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to create thread.");
      setSaving(false);
    }
  }

  const TAG_CLASS: Record<string, string> = {
    DIY: "diy", EDUCATION: "education", DOCS: "docs",
    TEARDOWN: "teardown", COMMUNITY: "community",
  };

  return (
    <div className="page">
      <div className="breadcrumb">
        <a href="/">Home</a>
        <span>›</span>
        New Thread
      </div>

      <h1 style={{ fontFamily: "'Linux Libertine O', Georgia, serif", fontSize: "1.8rem",
        fontWeight: 400, marginBottom: 24 }}>
        Start a New Thread
      </h1>

      {error && <div className="alert error">{error}</div>}

      <div className="form-group">
        <label className="form-label">Category</label>
        <select
          className="form-input"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">— Select a category —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Title</label>
        <input
          className="form-input"
          type="text"
          placeholder="Describe your question or topic clearly…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Content</label>
        <textarea
          className="form-input"
          style={{ minHeight: 200, lineHeight: 1.7 }}
          placeholder="Share details, include model numbers, describe what you've tried…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Tags</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TAGS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleTag(t)}
              className={`tag ${TAG_CLASS[t]}`}
              style={{
                cursor: "pointer",
                opacity: tags.includes(t) ? 1 : 0.4,
                border: tags.includes(t) ? "2px solid currentColor" : "2px solid transparent",
                padding: "4px 12px",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button className="btn-primary" onClick={submit} disabled={saving}>
          {saving ? "Posting…" : "Post Thread"}
        </button>
        <a className="btn-ghost" href="/"
          style={{ display: "inline-flex", alignItems: "center", padding: "7px 14px",
            border: "1px solid var(--border)", borderRadius: 3, fontFamily: "JetBrains Mono, monospace",
            fontSize: "0.68rem", color: "var(--text-meta)", letterSpacing: "0.04em",
            textDecoration: "none" }}>
          Cancel
        </a>
      </div>
    </div>
  );
}

export default function NewThreadPage() {
  return (
    <Suspense>
      <NewThreadForm />
    </Suspense>
  );
}
