import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export const revalidate = 60;

const TAG_CLASS: Record<string, string> = {
  DIY: "diy", EDUCATION: "education", DOCS: "docs",
  TEARDOWN: "teardown", COMMUNITY: "community",
};

function renderMarkdown(md: string): string {
  return md
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`\n]+)`/g, "<code>$1</code>")
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_m, _lang, code) =>
      `<pre><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`)
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, "<ul>$&</ul>")
    .replace(/^(?!<[hup]|$)(.+)$/gm, "<p>$1</p>")
    .replace(/\n{2,}/g, "\n");
}

function timeAgo(date: Date): string {
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

export default async function WikiPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const component = await prisma.component.findUnique({
    where: { slug },
    include: {
      category: { select: { slug: true, name: true } },
      wikiPage: {
        include: {
          author: { select: { username: true } },
          revisions: {
            orderBy: { createdAt: "desc" },
            take: 5,
            include: { author: { select: { username: true } } },
          },
        },
      },
    },
  });
  if (!component) notFound();

  const relatedThreads = await prisma.post.findMany({
    where: { components: { some: { componentId: component.id } } },
    orderBy: { voteScore: "desc" },
    take: 5,
    include: { author: { select: { username: true } }, _count: { select: { comments: true } } },
  });

  const specs = (component.specs as Array<{ label: string; value: string }>) ?? [];

  return (
    <div className="page">
      <div className="breadcrumb">
        <a href="/">Home</a>
        <span>›</span>
        <a href={`/category/${component.category.slug}`}>{component.category.name}</a>
        <span>›</span>
        {component.name}
      </div>

      <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>
        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontFamily: "'Linux Libertine O', Georgia, serif", fontSize: "2rem",
              fontWeight: 400, marginBottom: 8 }}>
              {component.name}
            </h1>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {component.tags.map((t) => (
                <span key={t} className={`tag ${TAG_CLASS[t] ?? ""}`}>{t}</span>
              ))}
            </div>
            {component.wikiPage && (
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.62rem",
                color: "var(--text-meta)" }}>
                Last edited by{" "}
                <span style={{ color: "var(--accent-dark)" }}>{component.wikiPage.author.username}</span>
                {" · "}{timeAgo(component.wikiPage.updatedAt)}
                {" · "}
                <a href={`/wiki/${slug}/edit`} style={{ color: "var(--accent)" }}>Edit this page</a>
              </div>
            )}
          </div>

          {component.wikiPage ? (
            <div
              className="wiki-content"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(component.wikiPage.content) }}
            />
          ) : (
            <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-meta)", fontStyle: "italic" }}>
              <p>No wiki page yet for this component.</p>
              <a className="btn-primary" href={`/wiki/${slug}/edit`} style={{ display: "inline-block", marginTop: 16 }}>
                Create Wiki Page
              </a>
            </div>
          )}

          {/* Related threads */}
          {relatedThreads.length > 0 && (
            <>
              <hr className="section-divider" />
              <div className="related-title">Forum Threads</div>
              <div className="thread-list" style={{ marginTop: 12 }}>
                {relatedThreads.map((post) => (
                  <a key={post.id} className="thread-item" href={`/thread/${post.id}`}>
                    <div className="thread-score">
                      <span className="thread-score-num">{post.voteScore}</span>
                      <span className="thread-score-label">votes</span>
                    </div>
                    <div className="thread-body">
                      <div className="thread-title">{post.title}</div>
                      <div className="thread-meta">
                        <span>{post.author.username}</span>
                      </div>
                    </div>
                    <div className="thread-comments">
                      <span>💬<br />{post._count.comments}</span>
                    </div>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sidebar infobox */}
        <div className="wiki-infobox" style={{ flexShrink: 0 }}>
          <div className="wiki-infobox-img">
            {component.imageBase64
              ? <img src={component.imageBase64} alt={component.name} />
              : component.category.name.split(" ")[0]}
          </div>
          <div className="wiki-infobox-title">{component.name}</div>
          <table className="wiki-spec-table">
            <tbody>
              {specs.map((spec) => (
                <tr key={spec.label}>
                  <td>{spec.label}</td>
                  <td>{spec.value}</td>
                </tr>
              ))}
              <tr>
                <td>Category</td>
                <td>
                  <a href={`/category/${component.category.slug}`}
                    style={{ color: "var(--accent)" }}>
                    {component.category.name}
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
          {component.wikiPage && (
            <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border)" }}>
              <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.58rem",
                color: "var(--text-meta)", letterSpacing: "0.04em", marginBottom: 6,
                textTransform: "uppercase" }}>
                Recent Editors
              </div>
              {component.wikiPage.revisions.map((r) => (
                <div key={r.id} style={{ fontFamily: "JetBrains Mono, monospace",
                  fontSize: "0.62rem", color: "var(--text-secondary)", marginBottom: 2 }}>
                  {r.author.username} — {timeAgo(r.createdAt)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
