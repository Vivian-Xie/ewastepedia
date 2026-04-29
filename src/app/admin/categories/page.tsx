"use client";
import { useEffect, useRef, useState } from "react";

type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  iconEmoji: string | null;
  tags: string[];
  displayOrder: number;
  imageBase64: string | null;
  _count: { posts: number; components: number };
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ slug: "", name: "", description: "", iconEmoji: "", tags: "", displayOrder: "0" });
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [savingImage, setSavingImage] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { refresh(); }, []);

  async function refresh() {
    const data = await fetch("/api/categories").then((r) => r.json());
    setCategories(data);
  }

  async function create() {
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        displayOrder: parseInt(form.displayOrder) || 0,
      }),
    });
    setCreating(false);
    setForm({ slug: "", name: "", description: "", iconEmoji: "", tags: "", displayOrder: "0" });
    refresh();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editingImageId) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setSavingImage(true);
      await fetch(`/api/categories/${editingImageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: dataUrl }),
      });
      setSavingImage(false);
      setEditingImageId(null);
      refresh();
    };
    reader.readAsDataURL(file);
  }

  async function removeImage(id: string) {
    await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: null }),
    });
    refresh();
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{ padding: "12px 20px 20px", fontFamily: "JetBrains Mono, monospace",
          fontSize: "0.62rem", color: "var(--text-meta)", letterSpacing: "0.08em",
          textTransform: "uppercase" }}>Admin Panel</div>
        <a className="admin-nav-item" href="/admin">Dashboard</a>
        <a className="admin-nav-item" href="/admin/posts">Posts</a>
        <a className="admin-nav-item" href="/admin/components">Components</a>
        <a className="admin-nav-item active" href="/admin/categories">Categories</a>
        <a className="admin-nav-item" href="/admin/users">Users</a>
        <div style={{ borderTop: "1px solid var(--border)", margin: "12px 0" }} />
        <a className="admin-nav-item" href="/" style={{ color: "var(--accent)" }}>← Back to Forum</a>
      </aside>

      <main className="admin-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Linux Libertine O', Georgia, serif", fontSize: "1.6rem", fontWeight: 400 }}>
            Categories
          </h1>
          <button className="btn-primary" onClick={() => setCreating(true)}>+ New Category</button>
        </div>

        {creating && (
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 4, padding: 24, marginBottom: 28 }}>
            <h2 style={{ fontFamily: "'Linux Libertine O', Georgia, serif", fontSize: "1.1rem",
              fontWeight: 400, marginBottom: 16 }}>New Category</h2>
            {[
              ["slug", "Slug (e.g. motors-actuators)"],
              ["name", "Display Name"],
              ["description", "Description"],
              ["iconEmoji", "Icon Emoji"],
              ["tags", "Tags (comma-separated)"],
              ["displayOrder", "Display Order (number)"],
            ].map(([key, label]) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <input className="form-input" value={(form as Record<string, string>)[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-primary" onClick={create}>Create</button>
              <button className="btn-ghost" onClick={() => setCreating(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <table className="admin-table">
          <thead>
            <tr>
              <th>Icon</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Posts</th>
              <th>Components</th>
              <th>Order</th>
              <th>Hover Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td style={{ fontSize: "1.4rem" }}>{c.iconEmoji}</td>
                <td>
                  <a href={`/category/${c.slug}`} style={{ color: "var(--accent)" }}>{c.name}</a>
                </td>
                <td style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.68rem",
                  color: "var(--text-meta)" }}>{c.slug}</td>
                <td style={{ textAlign: "center", fontFamily: "JetBrains Mono, monospace",
                  fontSize: "0.75rem" }}>{c._count.posts}</td>
                <td style={{ textAlign: "center", fontFamily: "JetBrains Mono, monospace",
                  fontSize: "0.75rem" }}>{c._count.components}</td>
                <td style={{ textAlign: "center", fontFamily: "JetBrains Mono, monospace",
                  fontSize: "0.75rem" }}>{c.displayOrder}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {c.imageBase64 ? (
                      <img
                        src={c.imageBase64}
                        alt={c.name}
                        style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover",
                          border: "1px solid var(--border)" }}
                      />
                    ) : (
                      <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.6rem",
                        color: "var(--text-meta)" }}>—</span>
                    )}
                    <button
                      className="btn-ghost"
                      style={{ fontSize: "0.58rem", padding: "2px 8px" }}
                      disabled={savingImage && editingImageId === c.id}
                      onClick={() => {
                        setEditingImageId(c.id);
                        fileRef.current?.click();
                      }}
                    >
                      {savingImage && editingImageId === c.id ? "Saving…" : "Upload"}
                    </button>
                    {c.imageBase64 && (
                      <button
                        className="btn-ghost"
                        style={{ fontSize: "0.58rem", padding: "2px 8px", color: "#c0392b",
                          borderColor: "#f5c6bc" }}
                        onClick={() => removeImage(c.id)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </td>
                <td>
                  <a href={`/category/${c.slug}`}
                    style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.6rem",
                      color: "var(--accent)", padding: "2px 6px", border: "1px solid var(--accent)",
                      borderRadius: 3, textDecoration: "none" }}>
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
