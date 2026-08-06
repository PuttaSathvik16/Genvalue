import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: "/privacy-policy",
    title: "Privacy Policy | GenValue",
    description: "How GenValue handles personal information when you use our site and programs.",
    ogTitle: "Privacy Policy | GenValue",
  });
}

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-zinc-50 px-4 py-14 text-zinc-700 sm:px-6 sm:py-16 lg:px-8 lg:py-20 dark:bg-[#050508] dark:text-slate-300">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#F59E0B]">Legal</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">Privacy Policy</h1>
        <p className="mt-4 text-sm text-zinc-600 dark:text-slate-400">
          Last updated: May 2026. This summary is provided for transparency; replace with counsel-reviewed copy before
          formal legal reliance.
        </p>
        <div className="mt-10 space-y-6 text-base leading-relaxed text-zinc-700 dark:text-slate-300">
          <p>
            GenValue respects your privacy. When you use our contact form or enroll in programs, we collect only
            the information you provide (such as name, email, phone, and message) to respond to inquiries and operate our
            services.
          </p>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Cookies, cache &amp; local storage</h2>
          <p>
            Like any website, your browser may keep <strong>temporary cache files</strong> (e.g. images, scripts) to load
            pages faster. We do not use that cache to identify you - it is normal browser behavior, not a paid tracking
            product.
          </p>
          <p>
            We also store a <strong>single site preference</strong> in your browser (e.g. local storage) so the
            &quot;Cookies &amp; privacy&quot; notice can stay dismissed after you accept or dismiss it. We are not
            using a commercial cookie-consent or analytics platform; the notice is provided as a simple formality and
            record of what we do today.
          </p>
          <p>
            We use trusted providers (such as email delivery services) to send correspondence; those providers process
            data according to their terms and applicable law. We do not sell your personal information.
          </p>
          <p>
            For questions or requests regarding your data, contact us at{" "}
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
