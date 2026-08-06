-- CreateEnum
CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED');

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" STRING NOT NULL,
    "slug" STRING NOT NULL,
    "title" STRING NOT NULL,
    "excerpt" STRING NOT NULL,
    "content" STRING NOT NULL,
    "category" STRING NOT NULL DEFAULT 'General AI',
    "tags" STRING[] DEFAULT ARRAY[]::STRING[],
    "coverImage" STRING,
    "readTime" STRING,
    "featured" BOOL NOT NULL DEFAULT false,
    "status" "BlogPostStatus" NOT NULL DEFAULT 'PENDING',
    "authorId" STRING NOT NULL,
    "reviewedById" STRING,
    "reviewNotes" STRING,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_authorId_idx" ON "blog_posts"("authorId");

-- CreateIndex
CREATE INDEX "blog_posts_status_idx" ON "blog_posts"("status");

-- CreateIndex
CREATE INDEX "blog_posts_publishedAt_idx" ON "blog_posts"("publishedAt");

-- CreateIndex
CREATE INDEX "blog_posts_featured_idx" ON "blog_posts"("featured");

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
