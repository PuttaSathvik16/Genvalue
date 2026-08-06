import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: "/instructors",
    title: "Instructors | GenValue",
    description:
      "Meet Sathvik Putta - Co-Founder & Instructor at GenValue. Practitioner-led AI tools training with real-world workflows.",
    ogTitle: "Instructors | GenValue",
  });
}

export default function InstructorsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
