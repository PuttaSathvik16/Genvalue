/**
 * Admins who receive bug-report alert emails.
 * Super Admin, CTO, and CPO — excludes Founder, Co-founder, and Instructor.
 */
const ALERT_ROLES = ["CTO", "CPO"];

export function isBugReportAlertRecipient(admin) {
  if (!admin?.isActive) return false;
  if (admin.isSuperAdmin) return true;

  const roles = admin.roles ?? [];

  if (
    roles.includes("FOUNDER") ||
    roles.includes("COFOUNDER") ||
    roles.includes("INSTRUCTOR")
  ) {
    return false;
  }

  return roles.some((role) => ALERT_ROLES.includes(role));
}

export async function listBugReportAlertRecipients(prisma) {
  const admins = await prisma.authorizedAdmin.findMany({
    where: { isActive: true },
    select: {
      email: true,
      name: true,
      isSuperAdmin: true,
      roles: true,
      isActive: true,
    },
  });

  return admins.filter(isBugReportAlertRecipient);
}
