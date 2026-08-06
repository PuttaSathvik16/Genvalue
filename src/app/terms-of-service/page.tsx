import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: "/terms-of-service",
    title: "Terms of Service | GenValue",
    description: "Terms that govern use of the GenValue website and programs.",
    ogTitle: "Terms of Service | GenValue",
  });
}

export default function TermsOfServicePage() {
  return (
    <div className="bg-zinc-50 px-4 py-14 text-zinc-700 sm:px-6 sm:py-16 lg:px-8 lg:py-20 dark:bg-[#050508] dark:text-slate-300">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#F59E0B]">Legal</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">Terms of Service</h1>
        <p className="mt-4 text-sm text-zinc-600 dark:text-slate-400">
          Last updated: May 2026. Replace with counsel-reviewed terms before formal reliance.
        </p>
        <div className="mt-10 space-y-6 text-base leading-relaxed text-zinc-700 dark:text-slate-300">
          <p>
            By accessing this website or enrolling in GenValue programs, you agree to use our services lawfully
            and to provide accurate information when you contact us or register.
          </p>
          <p>
            Course content, schedules, and pricing may change; we will communicate material updates through reasonable
            channels. Intellectual property in materials remains with GenValue and licensors unless stated
            otherwise.
          </p>
          <p>
            For questions about these terms, email{" "}
            <a
              href="mailto:genvalue.academy@gmail.com"
              className="font-medium text-[#2563EB] underline decoration-[#2563EB]/40 underline-offset-2 hover:decoration-[#2563EB] dark:text-[#60A5FA]"
            >
              genvalue.academy@gmail.com
            </a>
            .
          </p>
        </div>
        <p className="mt-12">
          <Link
            href="/"
            className="text-sm font-semibold text-[#2563EB] underline-offset-2 hover:underline dark:text-[#60A5FA]"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
