"use client";
import { useEffect, useState, useRef } from "react";

type Component = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageBase64: string | null;
  tags: string[];
  category: { name: string; slug: string };
  specs: Array<{ label: string; value: string }> | null;
};

type Category = { id: string; slug: string; name: string };

export default function AdminComponentsPage() {
  const [components, setComponents] = useState<Component[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Component | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    categoryId: "", slug: "", name: "", description: "",
    imageBase64: "", tags: "", specs: "",
  });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { refresh(); }, []);

  async function refresh() {
    const [comps, cats] = await Promise.all([
      fetch("/api/components").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]);
    setComponents(comps);
    setCategories(cats);
  }

  function startCreate() {
    setForm({ categoryId: "", slug: "", name: "", description: "", imageBase64: "", tags: "", specs: "" });
    setCreating(true);
    setEditing(null);
  }

  function startEdit(c: Component) {
    setForm({
      categoryId: "",
      slug: c.slug,
      name: c.name,
      description: c.description ?? "",
      imageBase64: c.imageBase64 ?? "",
      tags: c.tags.join(", "),
      specs: c.specs ? JSON.stringify(c.specs, null, 2) : "",
    });
    setEditing(c);
    setCreating(false);
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((f) => ({ ...f, imageBase64: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  }

  async function save() {
    let specs: unknown = null;
    try { specs = form.specs ? JSON.parse(form.specs) : null; }
    catch { alert("Specs JSON is invalid."); return; }

    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);

    if (editing) {
      await fetch(`/api/components/${editing.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, description: form.description,
          imageBase64: form.imageBase64 || null, tags, specs }),
      });
    } else {
      await fetch("/api/components", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: form.categoryId, slug: form.slug,
          name: form.name, description: form.description,
          imageBase64: form.imageBase64 || null, tags, specs }),
      });
    }
    setEditing(null);
    setCreating(false);
    refresh();
  }

  async function del(slug: string) {
    if (!confirm(`Delete component "${slug}"?`)) return;
    await fetch(`/api/components/${slug}`, { method: "DELETE" });
    refresh();
  }

  const showForm = creating || !!editing;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{ padding: "12px 20px 20px", fontFamily: "JetBrains Mono, monospace",
          fontSize: "0.62rem", color: "var(--text-meta)", letterSpacing: "0.08em",
          textTransform: "uppercase" }}>Admin Panel</div>
        <a className="admin-nav-item" href="/admin">Dashboard</a>
        <a className="admin-nav-item" href="/admin/posts">Posts</a>
        <a className="admin-nav-item active" href="/admin/components">Components</a>
        <a className="admin-nav-item" href="/admin/categories">Categories</a>
        <a className="admin-nav-item" href="/admin/users">Users</a>
        <div style={{ borderTop: "1px solid var(--border)", margin: "12px 0" }} />
        <a className="admin-nav-item" href="/" style={{ color: "var(--accent)" }}>← Back to Forum</a>
      </aside>

      <main className="admin-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Linux Libertine O', Georgia, serif", fontSize: "1.6rem", fontWeight: 400 }}>
            Components
          </h1>
          <button className="btn-primary" onClick={startCreate}>+ New Component</button>
        </div>

        {showForm && (
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 4, padding: 24, marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Linux Libertine O', Georgia, serif", fontSize: "1.15rem",
              fontWeight: 400, marginBottom: 18 }}>
              {editing ? `Edit: ${editing.name}` : "New Component"}
            </h2>

            {!editing && (
              <>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input" value={form.categoryId}
                    onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}>
                    <option value="">— select —</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Slug (URL, e.g. "28byj-48")</label>
                  <input className="form-input" value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" style={{ minHeight: 80 }} value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>

            <div className="form-group">
              <label className="form-label">Image (stored as base64)</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImage}
                style={{ marginBottom: 8 }} />
              {form.imageBase64 && (
                <img src={form.imageBase64} alt="preview"
                  style={{ width: 100, height: 100, objectFit: "contain", border: "1px solid var(--border)", borderRadius: 4 }} />
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Tags (comma-separated: DIY, EDUCATION, DOCS, TEARDOWN, COMMUNITY)</label>
              <input className="form-input" value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
            </div>

            <div className="form-group">
              <label className="form-label">Specs (JSON array: [{`{"label":"Voltage","value":"5V"}`}])</label>
              <textarea className="form-input" style={{ minHeight: 100, fontFamily: "JetBrains Mono, monospace", fontSize: "0.8rem" }}
                value={form.specs}
                onChange={(e) => setForm((f) => ({ ...f, specs: e.target.value }))} />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-primary" onClick={save}>Save</button>
              <button className="btn-ghost" onClick={() => { setEditing(null); setCreating(false); }}>Cancel</button>
            </div>
          </div>
        )}

        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Category</th>
              <th>Tags</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {components.map((c) => (
              <tr key={c.id}>
                <td>
                  <a href={`/wiki/${c.slug}`} style={{ color: "var(--accent)" }}>{c.name}</a>
                </td>
                <td style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.7rem", color: "var(--text-meta)" }}>
                  {c.slug}
                </td>
                <td style={{ fontSize: "0.85rem" }}>{c.category.name}</td>
                <td>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {c.tags.slice(0, 3).map((t) => (
                      <span key={t} style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.58rem",
                        background: "var(--accent-light)", color: "var(--accent)", padding: "1px 5px",
                        borderRadius: 2 }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  {c.imageBase64
                    ? <img src={c.imageBase64} alt={c.name} style={{ width: 36, height: 36, objectFit: "contain", borderRadius: 4 }} />
                    : <span style={{ color: "var(--text-meta)", fontSize: "0.7rem" }}>none</span>}
                </td>
                <td>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => startEdit(c)}
                      style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.6rem",
                        color: "var(--accent)", padding: "2px 6px", border: "1px solid var(--accent)",
                        borderRadius: 3, background: "none", cursor: "pointer" }}>
                      Edit
                    </button>
                    <a href={`/wiki/${c.slug}/edit`}
                      style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.6rem",
                        color: "var(--text-secondary)", padding: "2px 6px", border: "1px solid var(--border)",
                        borderRadius: 3, textDecoration: "none" }}>
                      Wiki
                    </a>
                    <button onClick={() => del(c.slug)}
                      style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.6rem",
                        color: "#c0392b", padding: "2px 6px", border: "1px solid #f5c6bc",
                        borderRadius: 3, background: "none", cursor: "pointer" }}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
