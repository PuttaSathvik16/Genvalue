import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: "/about",
    title: "About Us | GenValue",
    description:
      "GenValue teaches judgment for AI tools - mission, story, approach, and values behind our 12-week AI Tools Mastery program.",
    ogTitle: "About Us | GenValue",
  });
}

export default function AboutLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
