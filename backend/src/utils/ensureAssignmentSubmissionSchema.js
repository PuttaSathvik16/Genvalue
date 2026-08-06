import { prisma } from "../config/database.js";

/**
 * Idempotent: adds quizScore column for auto-graded MCQ portions on mixed submissions.
 */
export async function ensureAssignmentSubmissionSchema() {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS "quizScore" INT8;
  `);
}
