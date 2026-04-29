import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import CommentTree from "@/components/CommentTree";
import ReplyBox from "@/components/ReplyBox";

export const revalidate = 10;

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
  return `${Math.floor(hours / 24)}d ago`;
}

type CommentWithReplies = {
  id: string;
  body: string;
  voteScore: number;
  isOp: boolean;
  createdAt: Date;
  author: { username: string };
  children: CommentWithReplies[];
};

function nestComments(flat: Array<{
  id: string; parentId: string | null; body: string; voteScore: number;
  isOp: boolean; createdAt: Date; author: { username: string };
}>): CommentWithReplies[] {
  const map = new Map<string, CommentWithReplies>();
  const roots: CommentWithReplies[] = [];
  for (const c of flat) {
    map.set(c.id, { ...c, children: [] });
  }
  for (const c of flat) {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { username: true } },
      category: { select: { slug: true, name: true } },
      components: {
        include: {
          component: {
            select: { id: true, slug: true, name: true, description: true, imageBase64: true, tags: true },
          },
        },
      },
    },
  });
  if (!post) notFound();

  // increment views (fire-and-forget)
  prisma.post.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  const flatComments = await prisma.comment.findMany({
    where: { postId: id },
    orderBy: { createdAt: "asc" },
    include: { author: { select: { username: true } } },
  });

  const nestedComments = nestComments(flatComments);
  const referencedComponents = post.components.map((pc) => pc.component);

  return (
    <div className="page">
      <div className="breadcrumb">
        <a href="/">Home</a>
        <span>›</span>
        <a href={`/category/${post.category.slug}`}>{post.category.name}</a>
        <span>›</span>
        Thread
      </div>

      <div className={referencedComponents.length > 0 ? "thread-layout" : undefined}>
        {/* Main content */}
        <div className="thread-main">
          <div className="post-card">
            <div className="post-inner">
              <div className="vote-col">
                <button className="vote-btn up">▲</button>
                <span className="vote-count">{post.voteScore}</span>
                <button className="vote-btn down">▼</button>
              </div>
              <div className="post-body">
                <div className="post-meta">
                  {post.tags.map((t) => (
                    <span key={t} className={`tag ${TAG_CLASS[t] ?? ""}`}>{t}</span>
                  ))}
                  <span className="author-name">{post.author.username}</span>
                  <span>·</span>
                  <span>{timeAgo(post.createdAt)}</span>
                  <span>·</span>
                  <span>{post.category.name}</span>
                </div>
                <h1 className="post-title">{post.title}</h1>
                <p className="post-text">{post.body}</p>
                <div className="post-actions">
                  <button className="action-btn">💬 {flatComments.length} replies</button>
                  <button className="action-btn">↗ Share</button>
                  <button className="action-btn">🔖 Save</button>
                </div>
              </div>
            </div>
          </div>

          <ReplyBox postId={id} />

          <div className="reply-header">{flatComments.length} comments</div>
          <div className="comment-tree">
            <CommentTree comments={nestedComments} postAuthor={post.author.username} />
          </div>
        </div>

        {/* Sticky right sidebar */}
        {referencedComponents.length > 0 && (
          <aside className="thread-sidebar">
            <div className="related-title">Referenced Components</div>
            <div className="thread-sidebar-list">
              {referencedComponents.map((comp) => (
                <a key={comp.id} className="sidebar-comp-card" href={`/wiki/${comp.slug}`}>
                  <div className="comp-card-img" style={{ width: 36, height: 36, flexShrink: 0 }}>
                    {comp.imageBase64
                      ? <img src={comp.imageBase64} alt={comp.name} />
                      : "⚙️"}
                  </div>
                  <div>
                    <div className="comp-card-name" style={{ fontSize: "0.95rem" }}>{comp.name}</div>
                    {comp.description && (
                      <div className="comp-card-desc" style={{ fontSize: "0.75rem", marginBottom: 0 }}>
                        {comp.description}
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
