export const SITE = {
  name: "GenValue",
  /** Nav + footer mark (`public/` path). */
  logoMark: "/images/genvalue-logo.png",
  tagline: "Choosing the Right AI Tool for Every Task",
  description: "12-week practical program covering 40+ AI tools across 11 categories - for real-world professional results.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://genvalue.academy",
  email: "genvalue.academy@gmail.com",
  instructor: {
    name: "Sathvik Putta",
    title: "Co-Founder & Instructor, GenValue",
  },
  socials: {
    linkedin: "https://www.linkedin.com/company/genvalueacademy/",
    twitter: "#",
    youtube: "#",
    instagram: "#",
  },
  /** Public URL for syllabus PDF (file in /public/downloads/). */
  syllabusPdfUrl: "/downloads/GenValue_Academy_Syllabus.pdf",
  /** Suggested filename when the user saves the syllabus PDF. */
  syllabusDownloadFilename: "GenValue_Academy_AI_Tools_Mastery_Syllabus.pdf",
  course: {
    title: "AI Tools Mastery",
    subtitle: "for Real-World & Professional Applications",
    duration: "12 Weeks",
    level: "Beginner to Early Professional",
    format: "Practical · Case-Based · Project-Driven",
    tools: "40+",
    categories: "11",
  },
} as const;
