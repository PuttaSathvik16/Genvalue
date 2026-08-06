"use client";

import { useCallback, useState } from "react";
import { FaFacebook, FaLinkedin, FaLink, FaXTwitter } from "react-icons/fa6";

type Props = {
  readonly postUrl: string;
  readonly title: string;
  readonly excerpt?: string;
};

export function ShareButtons({ postUrl, title, excerpt }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [postUrl]);

  const encodedUrl = encodeURIComponent(postUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedSummary = encodeURIComponent(excerpt ?? title);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-slate-500">Share</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        <li>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-[#0A66C2] transition hover:bg-zinc-100 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
            aria-label="Share on LinkedIn"
          >
            <FaLinkedin className="h-5 w-5" />
          </a>
        </li>
        <li>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-800 transition hover:bg-zinc-100 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            aria-label="Share on X"
          >
            <FaXTwitter className="h-5 w-5" />
          </a>
        </li>
        <li>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-[#1877F2] transition hover:bg-zinc-100 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
            aria-label="Share on Facebook"
          >
            <FaFacebook className="h-5 w-5" />
          </a>
        </li>
        <li>
          <a
            href={`https://www.linkedin.com/feed/?shareActive=true&text=${encodedTitle}%0A%0A${encodedSummary}%0A%0A${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 px-3 text-xs font-bold text-[#0A66C2] transition hover:bg-zinc-100 dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10"
            aria-label="Post to LinkedIn feed"
          >
            Post
          </a>
        </li>
        <li>
          <button
            type="button"
            onClick={copy}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 transition hover:bg-zinc-100 dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            aria-label="Copy link"
          >
            <FaLink className="h-4 w-4" />
          </button>
        </li>
      </ul>
      {copied ? (
        <p className="mt-3 text-xs font-medium text-[#10B981]" role="status">
          Link copied — paste anywhere to share
        </p>
      ) : null}
    </div>
  );
}
