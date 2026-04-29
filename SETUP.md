# E-Wastepedia Forum — Setup Guide

## 数据库表设计

```
users          — 用户账户 (id, username, email, passwordHash, avatarBase64, role)
categories     — 分类板块 (id, slug, name, iconEmoji, tags[], displayOrder)
components     — 元件条目 (id, categoryId, slug, name, specs JSON, imageBase64, tags[])
wiki_pages     — Wiki 正文 (id, componentId, content Markdown, authorId)
wiki_revisions — Wiki 历史版本 (id, wikiPageId, content, authorId, summary)
posts          — 论坛帖子 (id, categoryId, authorId, title, body, tags[], voteScore)
post_components— 帖子引用元件 (postId, componentId)  ← 多对多
comments       — 评论/回复 (id, postId, parentId, authorId, body, voteScore, isOp)
votes          — 投票记录 (id, userId, postId?, commentId?, value +1/-1)
bookmarks      — 收藏 (id, userId, postId)
```

**图片全部以 base64 字符串形式存在 postgres，无需对象存储。**

---

## 本地开发

```bash
cd forum
npm install
cp .env.example .env.local   # 填入数据库连接串
npm run db:push              # 推送 schema 到数据库
npm run db:seed              # 写入种子数据（9个分类 + 3个元件 + 示例帖子）
npm run dev                  # 启动 http://localhost:3000
```

---

## 部署到 Vercel

### 1. 创建 Vercel Postgres 数据库
1. 进入 https://vercel.com → 你的项目 → Storage → Create Database → Postgres
2. 选择 Neon (免费 tier 足够)
3. 复制 `.env.local` 里需要的两个连接串

### 2. 推送到 GitHub
```bash
git init
git add .
git commit -m "init ewastepedia forum"
git remote add origin <your-repo-url>
git push -u origin main
```

### 3. 在 Vercel 导入项目
1. https://vercel.com → Add New Project → Import Git Repository
2. Root Directory 选 `forum/`
3. 添加环境变量（从 Vercel Postgres dashboard 复制）：
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `JWT_SECRET` (任意随机字符串，如 `openssl rand -base64 32` 生成)
4. Deploy

### 4. 运行 seed（首次部署后）
```bash
# 本地设置好 .env.local 后执行：
npm run db:seed
```

---

## 页面路由

| URL | 说明 |
|-----|------|
| `/` | 主页，9个分类围绕圆形 logo |
| `/category/motors-actuators` | 板块讨论列表 |
| `/thread/[id]` | 帖子详情 + Reddit式嵌套评论 |
| `/wiki/28byj-48` | 元件 Wiki 页 |
| `/wiki/28byj-48/edit` | 编辑 Wiki（Markdown） |
| `/new-thread` | 发新帖 |
| `/admin` | 管理后台 Dashboard |
| `/admin/posts` | 管理帖子（置顶/锁定/删除） |
| `/admin/components` | 管理元件（上传图片→base64） |
| `/admin/categories` | 管理分类 |
| `/admin/users` | 查看用户 |

## API 路由

| Method | URL | 说明 |
|--------|-----|------|
| GET/POST | `/api/posts` | 获取/创建帖子 |
| GET/PUT/DELETE | `/api/posts/[id]` | 单帖操作 |
| POST | `/api/comments` | 发评论/回复 |
| PUT/DELETE | `/api/comments/[id]` | 编辑/删除评论 |
| POST | `/api/votes` | 投票（+1/-1，幂等） |
| GET/POST | `/api/components` | 获取/创建元件 |
| GET/PUT/DELETE | `/api/components/[slug]` | 单元件操作 |
| GET/POST | `/api/categories` | 分类 CRUD |
| POST | `/api/wiki` | 创建/更新 Wiki（自动保存历史版本） |
| POST | `/api/auth` | login / register / logout |
