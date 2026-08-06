/** Organizational admin roles assigned by the super admin. */
import { toAdminPortalPath } from "@/lib/adminPortalSession";
export const ADMIN_ORG_ROLES = {
  FOUNDER: { key: "FOUNDER", label: "Founder" },
  COFOUNDER: { key: "COFOUNDER", label: "Co-founder" },
  CTO: { key: "CTO", label: "CTO" },
  CPO: { key: "CPO", label: "CPO" },
  INSTRUCTOR: { key: "INSTRUCTOR", label: "Instructor" },
} as const;

export type AdminOrgRoleKey = keyof typeof ADMIN_ORG_ROLES;

export type PortalSectionKey =
  | "ANALYTICS"
  | "STUDENTS"
  | "ANNOUNCEMENTS"
  | "AUDIT_LOGS"
  | "DISPATCH"
  | "SECURITY"
  | "BUG_REPORTS";

export const ADMIN_ORG_ROLE_LIST = Object.values(ADMIN_ORG_ROLES);
export const ADMIN_ORG_ROLE_CHECKLIST = ADMIN_ORG_ROLE_LIST;

export const GRANTABLE_PORTAL_SECTIONS: PortalSectionKey[] = ["SECURITY"];

export const GRANTABLE_PORTAL_SECTION_LABELS: Record<PortalSectionKey, string> = {
  ANALYTICS: "Analytics",
  STUDENTS: "Student Roster",
  ANNOUNCEMENTS: "Announcements",
  AUDIT_LOGS: "System Audit Logs",
  DISPATCH: "Dispatch",
  SECURITY: "Portal Security",
  BUG_REPORTS: "Bug Reports",
};

const FULL_PORTAL_ACCESS: PortalSectionKey[] = [
  "ANALYTICS",
  "STUDENTS",
  "ANNOUNCEMENTS",
  "AUDIT_LOGS",
  "DISPATCH",
  "BUG_REPORTS",
];

const LEADERSHIP_PORTAL_ACCESS: PortalSectionKey[] = [...FULL_PORTAL_ACCESS, "SECURITY"];

const INSTRUCTOR_PORTAL_ACCESS: PortalSectionKey[] = [
  "STUDENTS",
  "ANNOUNCEMENTS",
  "DISPATCH",
  "BUG_REPORTS",
];

const ORG_ROLE_PORTAL_ACCESS: Record<AdminOrgRoleKey, PortalSectionKey[]> = {
  FOUNDER: LEADERSHIP_PORTAL_ACCESS,
  COFOUNDER: LEADERSHIP_PORTAL_ACCESS,
  CTO: FULL_PORTAL_ACCESS,
  CPO: FULL_PORTAL_ACCESS,
  INSTRUCTOR: INSTRUCTOR_PORTAL_ACCESS,
};

/** Nav href → required portal section */
export const ADMIN_NAV_SECTION_MAP: Record<string, PortalSectionKey> = {
  "/admin": "ANALYTICS",
  "/admin/students": "STUDENTS",
  "/admin/announcements": "ANNOUNCEMENTS",
  "/admin/dispatch": "DISPATCH",
  "/admin/audit-logs": "AUDIT_LOGS",
  "/admin/security": "SECURITY",
  "/admin/bug-reports": "BUG_REPORTS",
};

function getPortalSectionsForOrgRoles(roles: string[] | undefined): PortalSectionKey[] {
  const sections = new Set<PortalSectionKey>();
  for (const role of roles ?? []) {
    const mapped = ORG_ROLE_PORTAL_ACCESS[role as AdminOrgRoleKey];
    if (mapped) {
      for (const section of mapped) sections.add(section);
    }
  }
  return [...sections];
}

export function adminHasPortalSection(
  profile:
    | { isSuperAdmin?: boolean; roles?: string[]; portalSections?: string[] }
    | null
    | undefined,
  section: PortalSectionKey
): boolean {
  if (!profile) return false;
  if (profile.isSuperAdmin) return true;
  if (getPortalSectionsForOrgRoles(profile.roles).includes(section)) return true;
  const extras = (profile.portalSections ?? []).filter((value): value is PortalSectionKey =>
    GRANTABLE_PORTAL_SECTIONS.includes(value as PortalSectionKey)
  );
  return extras.includes(section);
}

export function rolesGrantSecurityAccess(roles: string[] | undefined): boolean {
  return (roles ?? []).some((role) => role === "FOUNDER" || role === "COFOUNDER");
}

const NAV_ROUTE_ORDER: { href: string; section: PortalSectionKey }[] = [
  { href: "/admin", section: "ANALYTICS" },
  { href: "/admin/students", section: "STUDENTS" },
  { href: "/admin/announcements", section: "ANNOUNCEMENTS" },
  { href: "/admin/dispatch", section: "DISPATCH" },
  { href: "/admin/bug-reports", section: "BUG_REPORTS" },
  { href: "/admin/audit-logs", section: "AUDIT_LOGS" },
  { href: "/admin/security", section: "SECURITY" },
];

export function getFirstAllowedAdminHref(
  profile: { isSuperAdmin?: boolean; roles?: string[] } | null | undefined,
  sessionId?: string | null
): string {
  const match = NAV_ROUTE_ORDER.find((item) => adminHasPortalSection(profile, item.section));
  const internal = match?.href ?? "/admin/auth/login";
  if (!sessionId || internal === "/admin/auth/login") return internal;
  return toAdminPortalPath(sessionId, internal);
}

export function getOrgRoleLabel(role: string): string {
  const entry = ADMIN_ORG_ROLES[role as AdminOrgRoleKey];
  return entry?.label ?? role;
}
