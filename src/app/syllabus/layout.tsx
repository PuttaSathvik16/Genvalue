import type { Metadata } from "next";
import { SyllabusCourseJsonLd } from "@/components/seo/SyllabusCourseJsonLd";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: "/syllabus",
    title: "12-Week Syllabus | GenValue",
    description:
      "Full syllabus for AI Tools Mastery: learning objectives, 11 tool categories, weekly breakdown, evaluation criteria, and capstone project.",
    ogTitle: "12-Week Syllabus | GenValue",
  });
}

export default function SyllabusLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SyllabusCourseJsonLd />
      {children}
    </>
  );
}
