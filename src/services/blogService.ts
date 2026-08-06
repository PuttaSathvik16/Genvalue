import { API_URL } from "@/lib/api";
import type { BlogPost, BlogPostFormData } from "@/types/blog";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const json = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !json.success) {
    throw new Error(json.message ?? "Request failed");
  }
  return json.data as T;
}

export async function fetchPublishedPosts(params?: {
  limit?: number;
  featured?: boolean;
  tag?: string;
}): Promise<BlogPost[]> {
  const search = new URLSearchParams();
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.featured) search.set("featured", "true");
  if (params?.tag) search.set("tag", params.tag);

  const qs = search.toString();
  const response = await fetch(`${API_URL}/blog/posts${qs ? `?${qs}` : ""}`, {
    next: { revalidate: 60 },
  });
  return parseResponse<BlogPost[]>(response);
}

export async function fetchPostBySlug(slug: string, token?: string): Promise<BlogPost | null> {
  const headers: HeadersInit = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}/blog/posts/${encodeURIComponent(slug)}`, {
    headers,
    cache: "no-store",
  });

  if (response.status === 404) return null;
  return parseResponse<BlogPost>(response);
}

export async function fetchMyPosts(token: string): Promise<BlogPost[]> {
  const response = await fetch(`${API_URL}/blog/posts/mine/all`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return parseResponse<BlogPost[]>(response);
}

export async function fetchPendingPosts(token: string): Promise<BlogPost[]> {
  const response = await fetch(`${API_URL}/blog/admin/pending`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return parseResponse<BlogPost[]>(response);
}

export async function fetchAdminPosts(token: string, status?: string): Promise<BlogPost[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : "";
  const response = await fetch(`${API_URL}/blog/admin/list${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return parseResponse<BlogPost[]>(response);
}

export async function createBlogPost(token: string, data: BlogPostFormData): Promise<BlogPost> {
  const response = await fetch(`${API_URL}/blog/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return parseResponse<BlogPost>(response);
}

export async function createAdminBlogPost(token: string, data: BlogPostFormData): Promise<BlogPost> {
  const response = await fetch(`${API_URL}/blog/admin/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return parseResponse<BlogPost>(response);
}

export async function updateBlogPost(
  token: string,
  id: string,
  data: Partial<BlogPostFormData>
): Promise<BlogPost> {
  const response = await fetch(`${API_URL}/blog/posts/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return parseResponse<BlogPost>(response);
}

export async function approveBlogPost(
  token: string,
  id: string,
  featured?: boolean
): Promise<BlogPost> {
  const response = await fetch(`${API_URL}/blog/admin/${id}/approve`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ featured }),
  });
  return parseResponse<BlogPost>(response);
}

export async function rejectBlogPost(
  token: string,
  id: string,
  reviewNotes: string
): Promise<BlogPost> {
  const response = await fetch(`${API_URL}/blog/admin/${id}/reject`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reviewNotes }),
  });
  return parseResponse<BlogPost>(response);
}

export async function deleteBlogPost(token: string, id: string): Promise<void> {
  const response = await fetch(`${API_URL}/blog/posts/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  await parseResponse<null>(response);
}

export async function uploadBlogCoverImage(token: string, imageDataUri: string): Promise<string> {
  const response = await fetch(`${API_URL}/blog/upload-cover`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image: imageDataUri }),
  });
  const data = await parseResponse<{ url: string }>(response);
  return data.url;
}

export async function uploadAdminBlogCoverImage(token: string, imageDataUri: string): Promise<string> {
  const response = await fetch(`${API_URL}/blog/admin/upload-cover`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image: imageDataUri }),
  });
  const data = await parseResponse<{ url: string }>(response);
  return data.url;
}

/** Merge API posts with legacy static posts (static slugs win on conflict). */
export function mergeBlogPosts(apiPosts: BlogPost[], staticPosts: BlogPost[]): BlogPost[] {
  const bySlug = new Map<string, BlogPost>();
  for (const post of apiPosts) bySlug.set(post.slug, post);
  for (const post of staticPosts) bySlug.set(post.slug, post);
  return [...bySlug.values()].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getShareUrl(slug: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://genvalue.academy";
  return `${base.replace(/\/+$/, "")}/blog/${slug}`;
}
