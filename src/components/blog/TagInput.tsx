"use client";

import { useCallback, useId, useState, type KeyboardEvent } from "react";
import { FaXmark } from "react-icons/fa6";
import { normalizeTag, normalizeTags } from "@/lib/blogTags";

type Props = {
  tags: string[];
  onChange: (tags: string[]) => void;
  variant?: "portal" | "default";
  maxTags?: number;
};

export function TagInput({ tags, onChange, variant = "portal", maxTags = 10 }: Props) {
  const inputId = useId();
  const [draft, setDraft] = useState("");

  const inputClass =
    variant === "portal"
      ? "min-w-[120px] flex-1 border-0 bg-transparent px-1 py-1 text-sm font-medium text-[#2A2A28] outline-none placeholder:text-[#6B6558] dark:text-white dark:placeholder:text-slate-500"
      : "min-w-[120px] flex-1 border-0 bg-transparent px-1 py-1 text-sm outline-none dark:text-white";

  const containerClass =
    variant === "portal"
      ? "flex min-h-[52px] flex-wrap items-center gap-2 rounded-2xl border border-black/10 bg-white/60 px-3 py-2 focus-within:border-[#1E3FE0] dark:border-white/10 dark:bg-white/5 dark:focus-within:border-[#60A5FA]"
      : "flex min-h-[52px] flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-[#0D1B2A]";

  const addTag = useCallback(
    (raw: string) => {
      const next = normalizeTag(raw);
      if (!next) return;
      const merged = normalizeTags([...tags, next]);
      if (merged.length === tags.length) return;
      onChange(merged.slice(0, maxTags));
      setDraft("");
    },
    [tags, onChange, maxTags]
  );

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === "Backspace" && !draft && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div>
      <label htmlFor={inputId} className={variant === "portal" ? "mb-2 block text-sm font-bold text-[#2A2A28] dark:text-white" : "block text-sm font-semibold text-zinc-800 dark:text-slate-200"}>
        Tags
      </label>
      <div className={containerClass}>
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center gap-1 rounded-full bg-[#1E3FE0]/10 px-2.5 py-1 text-xs font-bold text-[#1E3FE0] dark:bg-[#60A5FA]/20 dark:text-[#60A5FA]"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              aria-label={`Remove tag ${tag}`}
              className="rounded-full p-0.5 transition hover:bg-[#1E3FE0]/20 dark:hover:bg-[#60A5FA]/30"
            >
              <FaXmark className="h-3 w-3" aria-hidden />
            </button>
          </span>
        ))}
        {tags.length < maxTags ? (
          <input
            id={inputId}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (draft.trim()) addTag(draft);
            }}
            placeholder={tags.length === 0 ? "Type a tag and press Enter" : "Add another…"}
            aria-label="Add tag"
            className={inputClass}
          />
        ) : null}
      </div>
      <p className="mt-1 text-xs text-[#6B6558] dark:text-slate-400">
        Press Enter after each tag · {tags.length}/{maxTags}
      </p>
    </div>
  );
}
