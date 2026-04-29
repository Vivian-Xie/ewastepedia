import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import BrowseComponents from "@/components/BrowseComponents";

export const revalidate = 30;

const TAG_CLASS: Record<string, string> = {
  DIY: "diy", EDUCATION: "education", DOCS: "docs",
  TEARDOWN: "teardown", COMMUNITY: "community",
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      components: { select: { id: true, slug: true, name: true, description: true, imageBase64: true, tags: true } },
      _count: { select: { posts: true } },
    },
  });
  if (!category) notFound();

  const posts = await prisma.post.findMany({
    where: { categoryId: category.id },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: {
      author: { select: { username: true } },
      _count: { select: { comments: true } },
    },
  });

  return (
    <div className="page">
      <div className="breadcrumb">
        <a href="/">Home</a>
        <span>›</span>
        <span>{category.name}</span>
      </div>

      {/* Category header */}
      <div className="cat-header">
        <div className="cat-icon">{category.iconEmoji}</div>
        <div className="cat-info">
          <h1>{category.name}</h1>
          <p>{category.description}</p>
        </div>
        <div className="cat-actions">
          <a className="btn-primary" href={`/new-thread?category=${slug}`}>+ New Thread</a>
        </div>
      </div>

      {/* Browse components */}
      {category.components.length > 0 && (
        <BrowseComponents components={category.components} />
      )}

      {/* Thread list */}
      <div className="thread-list">
        {posts.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--text-meta)", fontStyle: "italic" }}>
            No threads yet. Be the first to start a discussion!
          </div>
        )}
        {posts.map((post) => (
          <a key={post.id} className="thread-item" href={`/thread/${post.id}`}>
            <div className="thread-score">
              <span className="thread-score-num">{post.voteScore}</span>
              <span className="thread-score-label">votes</span>
            </div>
            <div className="thread-body">
              <div className="thread-title">
                {post.isPinned && <span style={{ marginRight: 8, color: "var(--accent)", fontSize: "0.8rem" }}>📌</span>}
                {post.title}
              </div>
              <div className="thread-meta">
                {post.tags.map((t) => (
                  <span key={t} className={`tag ${TAG_CLASS[t] ?? ""}`}>{t}</span>
                ))}
                <span>{post.author.username}</span>
                <span>·</span>
                <span>{timeAgo(post.createdAt)}</span>
                <span>·</span>
                <span>{post.viewCount} views</span>
              </div>
            </div>
            <div className="thread-comments">
              <span>💬<br />{post._count.comments}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
