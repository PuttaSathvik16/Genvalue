"use client";

import { useState, type FormEvent } from "react";
import { CoverImageField } from "@/components/blog/CoverImageField";
import { TagInput } from "@/components/blog/TagInput";
import { BLOG_CATEGORIES, type BlogPostFormData } from "@/types/blog";

type Props = {
  initial?: Partial<BlogPostFormData>;
  submitLabel: string;
  onSubmit: (data: BlogPostFormData) => Promise<void>;
  showFeatured?: boolean;
  loading?: boolean;
  variant?: "portal" | "default";
};

const EMPTY: BlogPostFormData = {
  title: "",
  excerpt: "",
  content: "",
  category: "General AI",
  tags: [],
  coverImage: "",
  featured: false,
};

const PORTAL_INPUT =
  "w-full rounded-2xl border border-black/10 bg-white/60 px-4 py-3 text-sm font-medium text-[#2A2A28] outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-[#60A5FA]";

const DEFAULT_INPUT =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-[#0D1B2A] dark:text-white";

export function BlogPostForm({
  initial,
  submitLabel,
  onSubmit,
  showFeatured = false,
  loading = false,
  variant = "default",
}: Props) {
  const [form, setForm] = useState<BlogPostFormData>({ ...EMPTY, ...initial });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  const inputClass = variant === "portal" ? PORTAL_INPUT : DEFAULT_INPUT;
  const labelClass =
    variant === "portal"
      ? "mb-2 block text-sm font-bold text-[#2A2A28] dark:text-white"
      : "block text-sm font-semibold text-zinc-800 dark:text-slate-200";
  const fieldWrap = variant === "portal" ? "mb-6" : "";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ ...form, tags: form.tags });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const disabled = loading || submitting || coverUploading;

  return (
    <form onSubmit={handleSubmit} className={variant === "portal" ? "" : "space-y-6"}>
      {error ? (
        <div
          className={`rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-600 dark:text-red-400 ${variant === "portal" ? "mb-6" : ""}`}
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {variant === "portal" ? (
        <div className="mb-6 rounded-2xl border border-[#1E3FE0]/20 bg-[#1E3FE0]/5 p-4 dark:border-[#60A5FA]/20 dark:bg-[#60A5FA]/5">
          <h4 className="mb-2 font-bold text-[#2A2A28] dark:text-white">Tips for a great dispatch:</h4>
          <ul className="space-y-1 text-sm text-[#6B6558] dark:text-slate-400">
            <li>• Share a specific tool, workflow, or lesson learned</li>
            <li>• Use a clear headline and short excerpt for the blog listing</li>
            <li>• Separate paragraphs with blank lines for easy reading</li>
            <li>• Posts are reviewed by admin before going live</li>
          </ul>
        </div>
      ) : null}

      <div className={fieldWrap}>
        <label htmlFor="blog-title" className={labelClass}>
          Title {variant === "portal" ? <span className="text-red-500">*</span> : null}
        </label>
        <input
          id="blog-title"
          required
          maxLength={255}
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className={variant === "portal" ? inputClass : `mt-2 ${inputClass}`}
          placeholder="Your dispatch headline"
          aria-label="Dispatch title"
        />
        {variant === "portal" ? (
          <p className="mt-1 text-xs text-[#6B6558] dark:text-slate-400">{form.title.length}/255 characters</p>
        ) : null}
      </div>

      <div className={fieldWrap}>
        <label htmlFor="blog-excerpt" className={labelClass}>
          Excerpt {variant === "portal" ? <span className="text-red-500">*</span> : null}
        </label>
        <textarea
          id="blog-excerpt"
          required
          maxLength={500}
          rows={2}
          value={form.excerpt}
          onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
          className={variant === "portal" ? inputClass : `mt-2 ${inputClass}`}
          placeholder="Short summary for the blog listing (max 500 chars)"
          aria-label="Dispatch excerpt"
        />
      </div>

      <div className={fieldWrap}>
        <label htmlFor="blog-content" className={labelClass}>
          Article body {variant === "portal" ? <span className="text-red-500">*</span> : null}
        </label>
        <textarea
          id="blog-content"
          required
          rows={14}
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          className={variant === "portal" ? inputClass : `mt-2 ${inputClass} font-mono leading-relaxed`}
          placeholder="Write your dispatch. Use blank lines between paragraphs."
          aria-label="Dispatch article body"
        />
      </div>

      <div className={fieldWrap}>
        <label htmlFor="blog-category" className={labelClass}>
          Category
        </label>
        <select
          id="blog-category"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          className={variant === "portal" ? inputClass : `mt-2 ${inputClass}`}
          aria-label="Dispatch category"
        >
          {BLOG_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className={fieldWrap}>
        <TagInput
          tags={form.tags}
          onChange={(tags) => setForm((f) => ({ ...f, tags }))}
          variant={variant}
        />
      </div>

      <CoverImageField
        value={form.coverImage}
        onChange={(url) => setForm((f) => ({ ...f, coverImage: url }))}
        variant={variant}
        onUploadingChange={setCoverUploading}
      />

      {showFeatured ? (
        <label className={`flex items-center gap-3 text-sm font-medium text-[#6B6558] dark:text-slate-300 ${variant === "portal" ? "mb-6" : ""}`}>
          <input
            type="checkbox"
            checked={Boolean(form.featured)}
            onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
            className="h-4 w-4 rounded border-black/20"
            aria-label="Feature on homepage Dispatch feed"
          />
          Feature on homepage Dispatch feed
        </label>
      ) : null}

      <button
        type="submit"
        disabled={disabled}
        aria-label={submitLabel}
        className={
          variant === "portal"
            ? "inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#1E3FE0] px-8 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition hover:bg-[#12266E] disabled:opacity-60 dark:bg-[#60A5FA] dark:text-[#070B19] sm:w-auto"
            : "inline-flex min-h-12 items-center justify-center rounded-full bg-[#2563EB] px-8 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition hover:bg-[#1d4ed8] disabled:opacity-60"
        }
      >
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
