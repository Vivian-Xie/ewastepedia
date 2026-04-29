import { prisma } from "@/lib/db";

export const revalidate = 0;

function timeAgo(date: Date): string {
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "#c0392b",
  MODERATOR: "var(--accent-dark)",
  MEMBER: "var(--text-meta)",
};

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { posts: true, comments: true } },
    },
  });

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{ padding: "12px 20px 20px", fontFamily: "JetBrains Mono, monospace",
          fontSize: "0.62rem", color: "var(--text-meta)", letterSpacing: "0.08em",
          textTransform: "uppercase" }}>Admin Panel</div>
        <a className="admin-nav-item" href="/admin">Dashboard</a>
        <a className="admin-nav-item" href="/admin/posts">Posts</a>
        <a className="admin-nav-item" href="/admin/components">Components</a>
        <a className="admin-nav-item" href="/admin/categories">Categories</a>
        <a className="admin-nav-item active" href="/admin/users">Users</a>
        <div style={{ borderTop: "1px solid var(--border)", margin: "12px 0" }} />
        <a className="admin-nav-item" href="/" style={{ color: "var(--accent)" }}>← Back to Forum</a>
      </aside>

      <main className="admin-content">
        <h1 style={{ fontFamily: "'Linux Libertine O', Georgia, serif", fontSize: "1.6rem",
          fontWeight: 400, marginBottom: 24 }}>
          Users ({users.length})
        </h1>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th style={{ textAlign: "center" }}>Posts</th>
              <th style={{ textAlign: "center" }}>Comments</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.8rem" }}>
                  {u.username}
                </td>
                <td style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.7rem",
                  color: "var(--text-meta)" }}>
                  {u.email}
                </td>
                <td>
                  <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.62rem",
                    color: ROLE_COLORS[u.role] ?? "var(--text-meta)", letterSpacing: "0.06em" }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ textAlign: "center", fontFamily: "JetBrains Mono, monospace",
                  fontSize: "0.75rem" }}>
                  {u._count.posts}
                </td>
                <td style={{ textAlign: "center", fontFamily: "JetBrains Mono, monospace",
                  fontSize: "0.75rem" }}>
                  {u._count.comments}
                </td>
                <td style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.65rem",
                  color: "var(--text-meta)" }}>
                  {timeAgo(u.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
