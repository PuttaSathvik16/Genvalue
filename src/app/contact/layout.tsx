import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: "/contact",
    title: "Contact | GenValue",
    description:
      "Reach GenValue - questions about AI Tools Mastery, corporate training, or partnerships. We reply within 24 hours.",
    ogTitle: "Contact | GenValue",
  });
}

export default function ContactLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
