"use client";
import { useState } from "react";

const POST_TAGS = ["DIY", "EDUCATION", "DOCS", "TEARDOWN", "COMMUNITY"] as const;
type PostTag = typeof POST_TAGS[number];

const TAG_CLASS: Record<PostTag, string> = {
  DIY: "diy", EDUCATION: "education", DOCS: "docs",
  TEARDOWN: "teardown", COMMUNITY: "community",
};

const TAG_SHORT: Record<PostTag, string> = {
  DIY: "DIY", EDUCATION: "Education", DOCS: "Docs",
  TEARDOWN: "Teardown", COMMUNITY: "Community",
};

const TAG_FILTER_LABEL: Record<PostTag, string> = {
  DIY: "DIY / Maker", EDUCATION: "Education", DOCS: "Official Docs",
  TEARDOWN: "Teardown", COMMUNITY: "Community",
};

const TAG_ACTIVE_STYLE: Record<PostTag, React.CSSProperties> = {
  DIY:       { background: "var(--tag-diy)",       color: "#fff", borderColor: "var(--tag-diy)" },
  EDUCATION: { background: "var(--tag-edu)",        color: "#fff", borderColor: "var(--tag-edu)" },
  DOCS:      { background: "var(--tag-docs)",       color: "#fff", borderColor: "var(--tag-docs)" },
  TEARDOWN:  { background: "var(--tag-teardown)",   color: "#fff", borderColor: "var(--tag-teardown)" },
  COMMUNITY: { background: "var(--tag-community)",  color: "#fff", borderColor: "var(--tag-community)" },
};

const TAG_IDLE_STYLE: Record<PostTag, React.CSSProperties> = {
  DIY:       { color: "var(--tag-diy)",       borderColor: "#a5d6a7" },
  EDUCATION: { color: "var(--tag-edu)",        borderColor: "#ffe082" },
  DOCS:      { color: "var(--tag-docs)",       borderColor: "#90caf9" },
  TEARDOWN:  { color: "var(--tag-teardown)",   borderColor: "#ffcc80" },
  COMMUNITY: { color: "var(--tag-community)",  borderColor: "#ce93d8" },
};

type Comp = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageBase64: string | null;
  tags: string[];
};

export default function BrowseComponents({ components }: { components: Comp[] }) {
  const [active, setActive] = useState<PostTag | null>(null);

  const isPostTag = (t: string): t is PostTag => (POST_TAGS as readonly string[]).includes(t);

  const filtered = active ? components.filter(c => c.tags.includes(active)) : components;

  const counts = POST_TAGS.reduce((acc, t) => {
    acc[t] = components.filter(c => c.tags.includes(t)).length;
    return acc;
  }, {} as Record<PostTag, number>);

  return (
    <div className="browse-section">
      {/* Header */}
      <div className="browse-section-header">
        <span className="browse-section-label">Browse Components</span>
        <span className="browse-scroll-hint">scroll →</span>
      </div>

      {/* Filter by tag */}
      <div style={{ marginBottom: 6 }}>
        <span className="browse-section-label" style={{ fontSize: "0.58rem" }}>Filter by tag</span>
      </div>
      <div className="filter-bar">
        <button
          className={`filter-pill${active === null ? " filter-pill-all-active" : ""}`}
          onClick={() => setActive(null)}
        >
          ALL <span className="filter-count">{components.length}</span>
        </button>
        {POST_TAGS.filter(t => counts[t] > 0).map(t => {
          const isActive = active === t;
          return (
            <button
              key={t}
              className="filter-pill"
              style={isActive ? TAG_ACTIVE_STYLE[t] : TAG_IDLE_STYLE[t]}
              onClick={() => setActive(isActive ? null : t)}
            >
              {TAG_FILTER_LABEL[t]} <span className="filter-count">{counts[t]}</span>
            </button>
          );
        })}
      </div>

      {/* Scrollable card row */}
      <div className="comp-scroll-wrapper">
        <div className="comp-scroll-track">
          {filtered.length === 0 && (
            <p style={{ padding: "32px 0", color: "var(--text-meta)", fontStyle: "italic", fontSize: "0.9rem" }}>
              No components with this tag yet.
            </p>
          )}
          {filtered.map(comp => {
            const visibleTags = comp.tags.filter(isPostTag).slice(0, 3);
            return (
              <a key={comp.id} className="comp-browse-card" href={`/wiki/${comp.slug}`}>
                <div className="comp-browse-img">
                  {comp.imageBase64
                    ? <img src={comp.imageBase64} alt={comp.name} />
                    : <span style={{ fontSize: "2.8rem" }}>⚙️</span>}
                </div>
                <div className="comp-browse-body">
                  <div className="comp-browse-name">{comp.name}</div>
                  {comp.description && (
                    <div className="comp-browse-desc">{comp.description}</div>
                  )}
                  <div className="comp-browse-tags">
                    {visibleTags.map(t => (
                      <span key={t} className={`tag ${TAG_CLASS[t]}`}>{TAG_SHORT[t]}</span>
                    ))}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
        <div className="comp-scroll-fade" />
      </div>
    </div>
  );
}
