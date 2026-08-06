/** Default role for every account created through the LMS portal (register, Google, auto-provision). */
export const LMS_STUDENT_ROLE = "STUDENT";

/** Roles that belong in the admin student roster filter. */
export const LMS_ROSTER_ROLES = ["STUDENT"];

/**
 * LMS public registration must always create student accounts.
 * Ignore any role sent by the client.
 */
export function resolveLmsSignupRole(_requestedRole) {
  return LMS_STUDENT_ROLE;
}

/**
 * True when a user row represents an LMS learner (not staff/admin portal accounts).
 */
export function isLmsStudentRole(role) {
  return role === LMS_STUDENT_ROLE;
}
