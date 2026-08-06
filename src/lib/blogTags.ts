/** Normalize a single tag for storage and comparison. */
export function normalizeTag(tag: string): string {
  return tag.trim().replace(/\s+/g, " ").slice(0, 40);
}

export function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of tags) {
    const t = normalizeTag(raw);
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(t);
    if (result.length >= 10) break;
  }
  return result;
}

export function tagsEqual(a: string, b: string): boolean {
  return normalizeTag(a).toLowerCase() === normalizeTag(b).toLowerCase();
}

export function postHasTag(post: { tags: string[] }, tag: string): boolean {
  const q = normalizeTag(tag).toLowerCase();
  return post.tags.some((t) => t.toLowerCase() === q);
}

export function collectTagsFromPosts(posts: readonly { tags: string[] }[]): string[] {
  const counts = new Map<string, { label: string; count: number }>();
  for (const post of posts) {
    for (const raw of post.tags ?? []) {
      const label = normalizeTag(raw);
      if (!label) continue;
      const key = label.toLowerCase();
      const existing = counts.get(key);
      if (existing) existing.count += 1;
      else counts.set(key, { label, count: 1 });
    }
  }
  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .map((x) => x.label);
}

export function filterPostsByTag<T extends { tags: string[] }>(posts: readonly T[], tag: string | null): T[] {
  if (!tag?.trim()) return [...posts];
  return posts.filter((p) => postHasTag(p, tag));
}

export function getRelatedPostsByTags<T extends { slug: string; tags: string[]; date: string }>(
  allPosts: readonly T[],
  current: T,
  limit = 4
): T[] {
  const others = allPosts.filter((p) => p.slug !== current.slug);
  const currentKeys = new Set((current.tags ?? []).map((t) => t.toLowerCase()));

  if (currentKeys.size === 0) {
    return others.slice(0, limit);
  }

  const scored = others
    .map((post) => {
      const overlap = (post.tags ?? []).filter((t) => currentKeys.has(t.toLowerCase())).length;
      return { post, overlap };
    })
    .filter((x) => x.overlap > 0)
    .sort(
      (a, b) =>
        b.overlap - a.overlap || new Date(b.post.date).getTime() - new Date(a.post.date).getTime()
    );

  const related = scored.map((x) => x.post);
  if (related.length >= limit) return related.slice(0, limit);

  const used = new Set(related.map((p) => p.slug));
  for (const post of others) {
    if (related.length >= limit) break;
    if (!used.has(post.slug)) {
      related.push(post);
      used.add(post.slug);
    }
  }
  return related;
}

export function blogTagHref(tag: string): string {
  return `/blog?tag=${encodeURIComponent(normalizeTag(tag))}`;
}
