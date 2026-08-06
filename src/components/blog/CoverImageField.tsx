"use client";

import Image from "next/image";
import { useCallback, useId, useRef, useState } from "react";
import { FaCloudArrowUp, FaLink, FaXmark } from "react-icons/fa6";
import { ensurePortalAuthToken } from "@/lib/portalAuth";
import { getAdminAuthToken } from "@/services/adminService";
import { uploadAdminBlogCoverImage, uploadBlogCoverImage } from "@/services/blogService";

type CoverMode = "link" | "upload";

type Props = {
  value: string;
  onChange: (url: string) => void;
  variant?: "portal" | "default";
  onUploadingChange?: (uploading: boolean) => void;
};

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export function CoverImageField({ value, onChange, variant = "portal", onUploadingChange }: Props) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<CoverMode>("link");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const inputClass =
    variant === "portal"
      ? "w-full rounded-2xl border border-black/10 bg-white/60 px-4 py-3 text-sm font-medium text-[#2A2A28] outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-[#60A5FA]"
      : "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-[#0D1B2A] dark:text-white";

  const labelClass =
    variant === "portal"
      ? "mb-2 block text-sm font-bold text-[#2A2A28] dark:text-white"
      : "block text-sm font-semibold text-zinc-800 dark:text-slate-200";

  const tabClass = (active: boolean) =>
    `rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
      active
        ? "bg-[#1E3FE0] text-white dark:bg-[#60A5FA] dark:text-[#070B19]"
        : "bg-black/5 text-[#6B6558] hover:bg-black/10 dark:bg-white/10 dark:text-slate-300"
    }`;

  const processFile = useCallback(
    async (file: File) => {
      setUploadError(null);

      if (!file.type.startsWith("image/")) {
        setUploadError("Please choose a JPEG, PNG, WebP, or GIF image.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setUploadError("Image must be 5 MB or smaller.");
        return;
      }

      const dataUri = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Could not read file"));
        reader.readAsDataURL(file);
      });

      setPreview(dataUri);
      setUploading(true);
      onUploadingChange?.(true);

      try {
        let url: string;
        if (variant === "portal") {
          const token = await ensurePortalAuthToken();
          if (!token) throw new Error("Please sign in to the LMS with Google");
          url = await uploadBlogCoverImage(token, dataUri);
        } else {
          const token = getAdminAuthToken();
          if (!token) throw new Error("Please sign in to the admin portal");
          url = await uploadAdminBlogCoverImage(token, dataUri);
        }
        onChange(url);
        setPreview(url);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed");
        setPreview(null);
      } finally {
        setUploading(false);
        onUploadingChange?.(false);
      }
    },
    [onChange, onUploadingChange, variant]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) void processFile(file);
  };

  const clearCover = () => {
    onChange("");
    setPreview(null);
    setUploadError(null);
  };

  const displayUrl = preview || value;

  return (
    <div className={variant === "portal" ? "mb-6" : ""}>
      <span className={labelClass}>Cover image (optional)</span>

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("link")}
          className={tabClass(mode === "link")}
          aria-label="Use image link"
          aria-pressed={mode === "link"}
        >
          <FaLink className="mr-1.5 inline h-3 w-3" aria-hidden />
          Paste link
        </button>
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={tabClass(mode === "upload")}
          aria-label="Upload image file"
          aria-pressed={mode === "upload"}
        >
          <FaCloudArrowUp className="mr-1.5 inline h-3 w-3" aria-hidden />
          Upload image
        </button>
      </div>

      {mode === "link" ? (
        <div className="mt-3">
          <input
            id={`${inputId}-link`}
            type="url"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setPreview(null);
            }}
            className={inputClass}
            placeholder="https://example.com/your-cover.jpg"
            aria-label="Cover image URL"
          />
        </div>
      ) : (
        <div className="mt-3">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/15 bg-white/40 px-6 py-10 text-center dark:border-white/15 dark:bg-white/5"
          >
            <FaCloudArrowUp className="h-10 w-10 text-[#1E3FE0]/40 dark:text-[#60A5FA]/40" aria-hidden />
            <p className="mt-3 text-sm font-semibold text-[#2A2A28] dark:text-white">
              Drag & drop or choose an image
            </p>
            <p className="mt-1 text-xs text-[#6B6558] dark:text-slate-400">JPEG, PNG, WebP, GIF · max 5 MB</p>
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              aria-label="Choose cover image file"
              className="mt-4 rounded-full bg-[#1E3FE0] px-6 py-2.5 text-xs font-bold uppercase text-white transition hover:bg-[#12266E] disabled:opacity-60 dark:bg-[#60A5FA] dark:text-[#070B19]"
            >
              {uploading ? "Uploading…" : "Choose file"}
            </button>
            <input
              ref={fileRef}
              id={`${inputId}-file`}
              type="file"
              accept={ACCEPT}
              onChange={handleFileChange}
              className="sr-only"
              aria-label="Cover image file input"
            />
          </div>
        </div>
      )}

      {uploadError ? (
        <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400" role="alert">
          {uploadError}
        </p>
      ) : null}

      {displayUrl ? (
        <div className="relative mt-4 overflow-hidden rounded-2xl border border-black/10 dark:border-white/10">
          <div className="relative aspect-[16/9] w-full bg-black/5">
            <Image
              src={displayUrl}
              alt="Cover preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 640px"
              unoptimized={displayUrl.startsWith("data:")}
            />
          </div>
          <button
            type="button"
            onClick={clearCover}
            aria-label="Remove cover image"
            className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
          >
            <FaXmark className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
