import { prisma } from "@/lib/db";
import AdminPostsClient from "./AdminPostsClient";

export const revalidate = 0;

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { username: true } },
      category: { select: { name: true, slug: true } },
      _count: { select: { comments: true } },
    },
  });
  return <AdminPostsClient posts={posts} />;
}
