"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ModuleEditor } from "@/components/admin/ModuleEditor";
import { listAdminCourses } from "@/services/adminService";

export default function AdminModuleEditorPage() {
  const params = useParams<{ courseId: string; weekNumber: string }>();
  const courseId = params.courseId;
  const weekNumber = Number(params.weekNumber);
  const [courseTitle, setCourseTitle] = useState<string>("");

  useEffect(() => {
    listAdminCourses()
      .then((courses) => {
        const course = courses.find((c) => c.id === courseId);
        if (course) setCourseTitle(course.title);
      })
      .catch(() => {
        /* optional title */
      });
  }, [courseId]);

  if (!courseId || Number.isNaN(weekNumber)) {
    return (
      <p className="text-sm font-semibold text-red-600 dark:text-red-400">Invalid module route.</p>
    );
  }

  return (
    <ModuleEditor courseId={courseId} weekNumber={weekNumber} courseTitle={courseTitle} />
  );
}
