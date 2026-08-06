"use client";

import { EnrollNowLink } from "@/components/ui/EnrollNowLink";
import { ShareButtons } from "@/components/blog/ShareButtons";

type Props = {
  readonly postUrl: string;
  readonly title: string;
  readonly excerpt?: string;
};

export function BlogPostSidebar({ postUrl, title, excerpt }: Props) {
  return (
    <aside className="flex flex-col gap-6">
      <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-gradient-to-br from-[#2563EB]/10 via-white to-amber-50 p-6 shadow-lg ring-1 ring-zinc-200/80 dark:border-white/10 dark:from-[#2563EB]/20 dark:via-[#0D1B2A] dark:to-[#0a1520] dark:ring-white/5">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Ready to level up?</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-slate-400">
          Join the 12-week AI Tools Mastery cohort - practical workflows, 40+ tools, real projects.
        </p>
        <EnrollNowLink className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#F59E0B] px-5 py-3 text-sm font-semibold text-[#0D1B2A] shadow-md transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F59E0B]">
          Enroll Now
        </EnrollNowLink>
      </div>

      <div className="sticky top-[calc(6rem+220px)] rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-[#0D1B2A]">
        <ShareButtons postUrl={postUrl} title={title} excerpt={excerpt} />
      </div>
    </aside>
  );
}
