import { prisma } from "@/lib/db";
import HomeCategoryLayout from "@/components/HomeCategoryLayout";

export const revalidate = 60;

export default async function HomePage() {
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: "asc" },
    select: {
      id: true, slug: true, name: true, iconEmoji: true, tags: true,
      _count: { select: { posts: true, components: true } },
    },
  });

  const totalPosts = await prisma.post.count();
  const totalComponents = await prisma.component.count();
  const totalUsers = await prisma.user.count();

  return (
    <div className="page" style={{ maxWidth: "1100px", padding: "0 24px 80px" }}>
      <header className="site-header">
        <h1 className="site-title"><span>E-Waste</span>pedia</h1>
        <p className="site-tagline">Community wiki and forum for salvaging, reusing, and understanding e-waste components.</p>
      </header>

      <div className="search-section">
        <div className="search-wrapper">
          <input className="search-input" type="text" placeholder="Search components, datasheets, guides…" />
          <button className="search-btn">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Search
          </button>
        </div>
        <p className="search-hint">Hover a category to preview · Click to explore</p>
      </div>

      <HomeCategoryLayout categories={categories} />

      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{totalPosts.toLocaleString()}</span>
          <span className="stat-label">threads</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{totalComponents.toLocaleString()}</span>
          <span className="stat-label">components</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{totalUsers.toLocaleString()}</span>
          <span className="stat-label">contributors</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{categories.length}</span>
          <span className="stat-label">categories</span>
        </div>
      </div>
    </div>
  );
}
