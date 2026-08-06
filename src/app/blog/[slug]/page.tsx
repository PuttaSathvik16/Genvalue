import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";
import { BlogPostSidebar } from "@/components/blog/BlogPostSidebar";
import { TagPills } from "@/components/blog/TagPills";
import { getPostBySlug as getStaticPost, getPostParagraphs, posts as staticPosts } from "@/data/posts";
import { authorInitials, categoryBadgeClass } from "@/lib/blog";
import { getRelatedPostsByTags } from "@/lib/blogTags";
import { buildPageMetadata } from "@/lib/seo";
import { fetchPostBySlug, fetchPublishedPosts, getShareUrl, mergeBlogPosts } from "@/services/blogService";
import type { BlogPost } from "@/types/blog";

type Props = Readonly<{ params: Promise<{ slug: string }> }>;

export const dynamic = "force-dynamic";

function formatPostDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${iso}T12:00:00`));
}

function getParagraphs(post: BlogPost): string[] {
  if (post.content?.trim()) {
    return post.content
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
  }
  return getPostParagraphs(post);
}

async function resolvePost(slug: string): Promise<BlogPost | null> {
  const staticPost = getStaticPost(slug);
  if (staticPost) return staticPost;

  try {
    const apiPost = await fetchPostBySlug(slug);
    return apiPost;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await resolvePost(slug);
  if (!post) {
    return { title: "Post not found" };
  }
  return buildPageMetadata({
    path: `/blog/${post.slug}`,
    title: `${post.title} | The GenValue Dispatch`,
    description: post.excerpt,
    ogTitle: post.title,
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await resolvePost(slug);
  if (!post) {
    notFound();
  }

  let related: BlogPost[] = [];
  let allPosts: BlogPost[] = staticPosts;
  try {
    const apiPosts = await fetchPublishedPosts({ limit: 50 });
    allPosts = mergeBlogPosts(apiPosts, staticPosts);
    related = getRelatedPostsByTags(allPosts, post, 4);
  } catch {
    related = getRelatedPostsByTags(staticPosts, post, 4);
  }

  const sharedTags = post.tags ?? [];

  const paragraphs = getParagraphs(post);
  const shareUrl = getShareUrl(post.slug);

  return (
    <article className="relative bg-[#EDE6D3] pb-24 text-[#2A2A28] dark:bg-[#070B19] dark:text-slate-200">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] [background-size:24px_24px] dark:opacity-[0.06] dark:[background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)]"
        aria-hidden="true"
      />

      <div className="sticky top-20 z-30 border-b border-black/10 bg-[#EDE6D3]/90 backdrop-blur-md dark:border-white/10 dark:bg-[#070B19]/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1E3FE0] transition hover:text-[#12266E] dark:text-[#60A5FA]"
          >
            <FaArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>The GenValue Dispatch</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-10 px-4 pt-12 sm:px-6 lg:grid-cols-[1fr_280px]">
        <div>
          <header>
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${categoryBadgeClass(post.category)}`}>
              {post.category}
            </span>
            <h1 className="font-display-custom mt-4 text-balance text-3xl font-extrabold tracking-tight text-[#2A2A28] dark:text-white sm:text-5xl">
              {post.title}
            </h1>
            <p className="mt-4 text-lg font-medium leading-relaxed text-[#6B6558] dark:text-slate-300">
              {post.excerpt}
            </p>
            <div className="mt-8 flex items-center gap-4 border-y border-black/10 py-4 dark:border-white/10">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1E3FE0] text-sm font-bold text-white shadow-md"
                aria-hidden
              >
                {authorInitials(post.author)}
              </span>
              <div className="min-w-0 flex-1 text-xs sm:text-sm">
                <p className="font-bold text-[#2A2A28] dark:text-white">{post.author}</p>
                <p className="text-[#6B6558] dark:text-slate-400">
                  {post.authorRole} · <time dateTime={post.date}>{formatPostDate(post.date)}</time> ·{" "}
                  <span className="font-semibold text-[#1E3FE0] dark:text-[#60A5FA]">{post.readTime}</span>
                </p>
              </div>
            </div>
          </header>

          {sharedTags.length > 0 ? (
            <div className="mt-6">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-500">
                Topics
              </p>
              <TagPills tags={sharedTags} size="md" />
            </div>
          ) : null}

          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-black/10 shadow-2xl dark:border-white/10">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>

          <div className="space-y-6 pt-10 text-base leading-relaxed text-[#2A2A28] dark:text-slate-200 sm:text-lg">
            {paragraphs.map((paragraph, i) => (
              <p
                key={`p-${i}`}
                className={
                  i === 0
                    ? "first-letter:float-left first-letter:mr-3 first-letter:text-5xl first-letter:font-extrabold first-letter:text-[#1E3FE0] dark:first-letter:text-[#60A5FA]"
                    : undefined
                }
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-16 rounded-3xl border border-black/10 bg-[#F6F1E4] p-8 shadow-xl dark:border-white/10 dark:bg-[#0D1B2A]">
            <span className="font-annotation text-xs font-bold uppercase tracking-wider text-[#E8622E]">
              ★ WRITTEN BY
            </span>
            <div className="mt-4 flex items-center gap-4">
              <span
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#1E3FE0] text-lg font-extrabold text-white shadow-lg"
                aria-hidden
              >
                {authorInitials(post.author)}
              </span>
              <div>
                <h3 className="font-display-custom text-xl font-bold text-[#2A2A28] dark:text-white">
                  {post.author}
                </h3>
                <p className="text-xs font-semibold text-[#1E3FE0] dark:text-[#60A5FA]">{post.authorRole}</p>
              </div>
            </div>
          </div>

          {related.length > 0 ? (
            <div className="mt-16 border-t border-black/10 pt-12 dark:border-white/10">
              <h2 className="font-display-custom text-2xl font-extrabold text-[#2A2A28] dark:text-white">
                {sharedTags.length > 0 ? "Related Topics" : "More from The Dispatch"}
              </h2>
              {sharedTags.length > 0 ? (
                <p className="mt-2 text-sm text-[#6B6558] dark:text-slate-400">
                  More dispatches covering{" "}
                  {sharedTags.slice(0, 3).map((t) => `#${t}`).join(", ")}
                </p>
              ) : null}
              <ul className="mt-6 grid gap-6 sm:grid-cols-2">
                {related.map((r) => (
                  <li key={r.slug}>
                    <div className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-5 dark:border-white/10 dark:bg-[#0D1B2A]">
                      <Link
                        href={`/blog/${r.slug}`}
                        className="group block"
                      >
                        <h3 className="font-bold text-[#2A2A28] group-hover:text-[#1E3FE0] dark:text-white">
                          {r.title}
                        </h3>
                        <p className="mt-1 text-xs text-[#6B6558] dark:text-slate-400">{r.author}</p>
                      </Link>
                      {(r.tags?.length ?? 0) > 0 ? (
                        <div className="mt-3">
                          <TagPills tags={r.tags.slice(0, 3)} size="sm" />
                        </div>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <BlogPostSidebar postUrl={shareUrl} title={post.title} excerpt={post.excerpt} />
      </div>
    </article>
  );
}
