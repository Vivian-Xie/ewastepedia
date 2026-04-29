import { prisma } from "@/lib/db";

export const revalidate = 0;

export default async function AdminPage() {
  const [userCount, postCount, commentCount, componentCount, categoryCount] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.comment.count(),
    prisma.component.count(),
    prisma.category.count(),
  ]);

  const recentPosts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      author: { select: { username: true } },
      category: { select: { name: true, slug: true } },
      _count: { select: { comments: true } },
    },
  });

  function timeAgo(date: Date): string {
    const days = Math.floor((Date.now() - date.getTime()) / 86400000);
    if (days === 0) return "today";
    if (days === 1) return "yesterday";
    return `${days}d ago`;
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{ padding: "12px 20px 20px", fontFamily: "JetBrains Mono, monospace",
          fontSize: "0.62rem", color: "var(--text-meta)", letterSpacing: "0.08em",
          textTransform: "uppercase" }}>
          Admin Panel
        </div>
        <a className="admin-nav-item active" href="/admin">Dashboard</a>
        <a className="admin-nav-item" href="/admin/posts">Posts</a>
        <a className="admin-nav-item" href="/admin/components">Components</a>
        <a className="admin-nav-item" href="/admin/categories">Categories</a>
        <a className="admin-nav-item" href="/admin/users">Users</a>
        <div style={{ borderTop: "1px solid var(--border)", margin: "12px 0" }} />
        <a className="admin-nav-item" href="/" style={{ color: "var(--accent)" }}>← Back to Forum</a>
      </aside>

      <main className="admin-content">
        <h1 style={{ fontFamily: "'Linux Libertine O', Georgia, serif", fontSize: "1.6rem",
          fontWeight: 400, marginBottom: 24 }}>
          Dashboard
        </h1>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Users", value: userCount, href: "/admin/users" },
            { label: "Posts", value: postCount, href: "/admin/posts" },
            { label: "Comments", value: commentCount, href: "#" },
            { label: "Components", value: componentCount, href: "/admin/components" },
            { label: "Categories", value: categoryCount, href: "/admin/categories" },
          ].map((s) => (
            <a key={s.label} href={s.href}
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)",
                borderRadius: 4, padding: "16px 20px", textDecoration: "none", color: "inherit",
                transition: "border-color 0.15s" }}>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "1.6rem",
                fontWeight: 500, color: "var(--accent)" }}>
                {s.value}
              </div>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.62rem",
                color: "var(--text-meta)", letterSpacing: "0.06em", textTransform: "uppercase",
                marginTop: 4 }}>
                {s.label}
              </div>
            </a>
          ))}
        </div>

        {/* Recent posts */}
        <h2 style={{ fontFamily: "'Linux Libertine O', Georgia, serif", fontSize: "1.15rem",
          fontWeight: 400, marginBottom: 14 }}>
          Recent Posts
        </h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Votes</th>
              <th>Comments</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentPosts.map((p) => (
              <tr key={p.id}>
                <td>
                  <a href={`/thread/${p.id}`} style={{ color: "var(--accent)" }}>
                    {p.title.length > 50 ? p.title.slice(0, 50) + "…" : p.title}
                  </a>
                </td>
                <td style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.72rem" }}>
                  {p.author.username}
                </td>
                <td>
                  <a href={`/category/${p.category.slug}`}
                    style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.68rem",
                      color: "var(--text-secondary)" }}>
                    {p.category.name}
                  </a>
                </td>
                <td style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.72rem",
                  textAlign: "center" }}>
                  {p.voteScore}
                </td>
                <td style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.72rem",
                  textAlign: "center" }}>
                  {p._count.comments}
                </td>
                <td style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.65rem",
                  color: "var(--text-meta)" }}>
                  {timeAgo(p.createdAt)}
                </td>
                <td>
                  <AdminPostActions postId={p.id} isPinned={p.isPinned} isLocked={p.isLocked} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

function AdminPostActions({
  postId,
  isPinned,
  isLocked,
}: {
  postId: string;
  isPinned: boolean;
  isLocked: boolean;
}) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      <a href={`/thread/${postId}`}
        style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.6rem",
          color: "var(--accent)", padding: "2px 6px", border: "1px solid var(--accent)",
          borderRadius: 3, textDecoration: "none" }}>
        View
      </a>
      <form action={`/api/posts/${postId}`} method="POST">
        <button
          type="button"
          style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.6rem",
            color: isPinned ? "var(--vote-up)" : "var(--text-meta)", padding: "2px 6px",
            border: "1px solid var(--border)", borderRadius: 3, background: "none", cursor: "pointer" }}
          title={isPinned ? "Unpin" : "Pin"}
        >
          {isPinned ? "📌" : "Pin"}
        </button>
      </form>
    </div>
  );
}
