"use client";
import { useState } from "react";

type CommentNode = {
  id: string;
  body: string;
  voteScore: number;
  isOp: boolean;
  createdAt: Date;
  author: { username: string };
  children: CommentNode[];
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function Comment({
  comment,
  postAuthor,
  depth = 0,
}: {
  comment: CommentNode;
  postAuthor: string;
  depth?: number;
}) {
  const [score, setScore] = useState(comment.voteScore);
  const [voted, setVoted] = useState<1 | -1 | 0>(0);
  const [collapsed, setCollapsed] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");

  function vote(dir: 1 | -1) {
    if (voted === dir) {
      setScore(score - dir);
      setVoted(0);
    } else {
      setScore(score - voted + dir);
      setVoted(dir);
    }
  }

  async function submitReply() {
    if (!replyText.trim()) return;
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: comment.id, parentId: comment.id, body: replyText }),
    });
    setReplyText("");
    setReplyOpen(false);
    window.location.reload();
  }

  return (
    <div>
      <div className="comment">
        <div className="vote-col">
          <button
            className={`vote-btn up${voted === 1 ? " active" : ""}`}
            onClick={() => vote(1)}
          >▲</button>
          <span className="vote-count">{score}</span>
          <button
            className={`vote-btn down${voted === -1 ? " active" : ""}`}
            onClick={() => vote(-1)}
          >▼</button>
        </div>
        <div className="post-body">
          <div className="post-meta">
            <span className="author-name">{comment.author.username}</span>
            {comment.isOp && <span className="op-badge">OP</span>}
            <span>·</span>
            <span>{timeAgo(comment.createdAt)}</span>
            {comment.children.length > 0 && (
              <button
                onClick={() => setCollapsed(!collapsed)}
                style={{ marginLeft: 8, background: "none", border: "none", cursor: "pointer",
                  fontFamily: "JetBrains Mono, monospace", fontSize: "0.58rem",
                  color: "var(--text-meta)" }}
              >
                {collapsed ? `[+] ${comment.children.length} replies` : "[–]"}
              </button>
            )}
          </div>
          <p className="post-text">{comment.body}</p>
          <div className="post-actions">
            <button className="action-btn" onClick={() => setReplyOpen(!replyOpen)}>↩ Reply</button>
            <button className="action-btn">↗ Share</button>
          </div>
          {replyOpen && (
            <div style={{ marginTop: 10 }}>
              <textarea
                className="form-input"
                style={{ minHeight: 80, marginBottom: 8 }}
                placeholder="Write a reply…"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-primary" onClick={submitReply}>Post Reply</button>
                <button className="btn-ghost" onClick={() => setReplyOpen(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {!collapsed && comment.children.length > 0 && (
        <div className="comment-children">
          {comment.children.map((child) => (
            <Comment
              key={child.id}
              comment={child}
              postAuthor={postAuthor}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentTree({
  comments,
  postAuthor,
}: {
  comments: CommentNode[];
  postAuthor: string;
}) {
  return (
    <>
      {comments.map((c) => (
        <Comment key={c.id} comment={c} postAuthor={postAuthor} />
      ))}
    </>
  );
}
