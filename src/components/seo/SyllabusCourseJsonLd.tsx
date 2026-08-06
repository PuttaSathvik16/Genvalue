import { course } from "@/data/course";
import { SITE_URL } from "@/lib/site";

/**
 * Schema.org CourseOffering for AI Tools Mastery (syllabus page).
 */
export function SyllabusCourseJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CourseOffering",
    name: course.title,
    description: course.subtitle,
    url: `${SITE_URL}/syllabus`,
    duration: "P12W",
    educationalLevel: course.level,
    teaches: [...course.learningObjectives],
    provider: {
      "@type": "EducationalOrganization",
      name: course.instructor.academy,
      email: course.instructor.email,
      url: SITE_URL,
    },
    instructor: {
      "@type": "Person",
      name: course.instructor.name,
      email: course.instructor.email,
    },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/contact`,
      description: course.price,
    },
    courseWorkload: course.duration,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      duration: "P12W",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
