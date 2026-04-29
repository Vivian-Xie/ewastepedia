"use client";
import { useState } from "react";

export default function ReplyBox({ postId }: { postId: string }) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!body.trim()) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, body }),
    });
    if (res.ok) {
      setBody("");
      window.location.reload();
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to post comment.");
    }
    setLoading(false);
  }

  return (
    <div className="reply-box" style={{ marginTop: 16 }}>
      <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.65rem",
        letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--text-meta)",
        marginBottom: 10 }}>
        Leave a comment
      </div>
      {error && <div className="alert error">{error}</div>}
      <textarea
        placeholder="Share your knowledge, ask a question, or add a tip…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="reply-box-actions">
        <button className="btn-ghost" onClick={() => setBody("")}>Clear</button>
        <button className="btn-primary" onClick={submit} disabled={loading}>
          {loading ? "Posting…" : "Post Comment"}
        </button>
      </div>
    </div>
  );
}
