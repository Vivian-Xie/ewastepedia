"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Topbar() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/") return null;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <nav className="topbar">
      <div className="topbar-inner">
        <a className="site-wordmark" href="/"><span>E-Waste</span>pedia</a>
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search components, threads, model numbers…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        <nav className="topbar-nav">
          <a className="nav-link" href="/new-thread">New Thread</a>
          <a className="nav-link" href="/admin">Admin</a>
        </nav>
      </div>
    </nav>
  );
}
