"use client";
import { useState } from "react";

type Post = {
  id: string;
  title: string;
  voteScore: number;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: Date;
  author: { username: string };
  category: { name: string; slug: string };
  _count: { comments: number };
};

function timeAgo(date: Date): string {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

export default function AdminPostsClient({ posts: initial }: { posts: Post[] }) {
  const [posts, setPosts] = useState(initial);

  async function toggle(id: string, field: "isPinned" | "isLocked", current: boolean) {
    await fetch(`/api/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !current }),
    });
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, [field]: !current } : p));
  }

  async function del(id: string, title: string) {
    if (!confirm(`Delete post: "${title}"?`)) return;
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{ padding: "12px 20px 20px", fontFamily: "JetBrains Mono, monospace",
          fontSize: "0.62rem", color: "var(--text-meta)", letterSpacing: "0.08em",
          textTransform: "uppercase" }}>Admin Panel</div>
        <a className="admin-nav-item" href="/admin">Dashboard</a>
        <a className="admin-nav-item active" href="/admin/posts">Posts</a>
        <a className="admin-nav-item" href="/admin/components">Components</a>
        <a className="admin-nav-item" href="/admin/categories">Categories</a>
        <a className="admin-nav-item" href="/admin/users">Users</a>
        <div style={{ borderTop: "1px solid var(--border)", margin: "12px 0" }} />
        <a className="admin-nav-item" href="/" style={{ color: "var(--accent)" }}>← Back to Forum</a>
      </aside>

      <main className="admin-content">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Linux Libertine O', Georgia, serif", fontSize: "1.6rem", fontWeight: 400 }}>
            Posts ({posts.length})
          </h1>
          <a className="btn-primary" href="/new-thread" style={{ textDecoration: "none",
            display: "inline-block", padding: "7px 18px" }}>
            + New Thread
          </a>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th style={{ textAlign: "center" }}>Votes</th>
              <th style={{ textAlign: "center" }}>Comments</th>
              <th style={{ textAlign: "center" }}>Views</th>
              <th>Created</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td>
                  <a href={`/thread/${p.id}`} style={{ color: "var(--accent)" }}>
                    {p.title.length > 45 ? p.title.slice(0, 45) + "…" : p.title}
                  </a>
                </td>
                <td style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.7rem" }}>
                  {p.author.username}
                </td>
                <td style={{ fontSize: "0.8rem" }}>
                  <a href={`/category/${p.category.slug}`} style={{ color: "var(--text-secondary)" }}>
                    {p.category.name}
                  </a>
                </td>
                <td style={{ textAlign: "center", fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem" }}>
                  {p.voteScore}
                </td>
                <td style={{ textAlign: "center", fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem" }}>
                  {p._count.comments}
                </td>
                <td style={{ textAlign: "center", fontFamily: "JetBrains Mono, monospace", fontSize: "0.75rem" }}>
                  {p.viewCount}
                </td>
                <td style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.65rem", color: "var(--text-meta)" }}>
                  {timeAgo(p.createdAt)}
                </td>
                <td>
                  <div style={{ display: "flex", gap: 4 }}>
                    {p.isPinned && <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.58rem",
                      background: "#fff3e0", color: "#c0621a", padding: "1px 5px", borderRadius: 2 }}>PINNED</span>}
                    {p.isLocked && <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.58rem",
                      background: "#fde8e0", color: "#c0392b", padding: "1px 5px", borderRadius: 2 }}>LOCKED</span>}
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => toggle(p.id, "isPinned", p.isPinned)}
                      style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.58rem",
                        color: p.isPinned ? "var(--vote-up)" : "var(--text-meta)",
                        padding: "2px 5px", border: "1px solid var(--border)",
                        borderRadius: 3, background: "none", cursor: "pointer" }}>
                      {p.isPinned ? "Unpin" : "📌 Pin"}
                    </button>
                    <button onClick={() => toggle(p.id, "isLocked", p.isLocked)}
                      style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.58rem",
                        color: p.isLocked ? "#c0392b" : "var(--text-meta)",
                        padding: "2px 5px", border: "1px solid var(--border)",
                        borderRadius: 3, background: "none", cursor: "pointer" }}>
                      {p.isLocked ? "Unlock" : "🔒 Lock"}
                    </button>
                    <button onClick={() => del(p.id, p.title)}
                      style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.58rem",
                        color: "#c0392b", padding: "2px 5px", border: "1px solid #f5c6bc",
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
