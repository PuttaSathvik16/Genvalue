import { prisma } from "../config/database.js";

export async function ensureStudentPlannerSchema() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS student_planner_events (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      "userId" STRING NOT NULL,
      title STRING NOT NULL,
      description STRING,
      category STRING NOT NULL DEFAULT 'STUDY',
      "scheduledAt" TIMESTAMP NOT NULL,
      "endAt" TIMESTAMP,
      "allDay" BOOL NOT NULL DEFAULT false,
      completed BOOL NOT NULL DEFAULT false,
      "completedAt" TIMESTAMP,
      "createdAt" TIMESTAMP NOT NULL DEFAULT current_timestamp(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT current_timestamp()
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS student_planner_events_user_id_idx ON student_planner_events ("userId");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS student_planner_events_scheduled_at_idx ON student_planner_events ("scheduledAt");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS student_activity_logs (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      "userId" STRING NOT NULL,
      type STRING NOT NULL,
      label STRING,
      "occurredAt" TIMESTAMP NOT NULL DEFAULT current_timestamp()
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS student_activity_logs_user_id_idx ON student_activity_logs ("userId");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS student_activity_logs_occurred_at_idx ON student_activity_logs ("occurredAt");
  `);
}
