/** Organizational admin roles (titles), not LMS user roles. */
export const ADMIN_ORG_ROLES = {
  FOUNDER: { key: "FOUNDER", label: "Founder" },
  COFOUNDER: { key: "COFOUNDER", label: "Co-founder" },
  CTO: { key: "CTO", label: "CTO" },
  CPO: { key: "CPO", label: "CPO" },
  INSTRUCTOR: { key: "INSTRUCTOR", label: "Instructor" },
};

export const ALL_ADMIN_ORG_ROLE_KEYS = Object.keys(ADMIN_ORG_ROLES);

/** All roles shown in the admin UI checklist. */
export const ADMIN_ORG_ROLE_CHECKLIST = ALL_ADMIN_ORG_ROLE_KEYS;

/** Roles assignable when adding or editing authorized admin emails. */
export const ASSIGNABLE_ADMIN_ORG_ROLES = [
  "FOUNDER",
  "COFOUNDER",
  "CTO",
  "CPO",
  "INSTRUCTOR",
];

export const SUPER_ADMIN_ORG_ROLES = ["CTO"];

export const PORTAL_SECTIONS = {
  ANALYTICS: "ANALYTICS",
  STUDENTS: "STUDENTS",
  ANNOUNCEMENTS: "ANNOUNCEMENTS",
  AUDIT_LOGS: "AUDIT_LOGS",
  DISPATCH: "DISPATCH",
  SECURITY: "SECURITY",
  BUG_REPORTS: "BUG_REPORTS",
};

/** Sections a super admin can explicitly grant beyond org-role defaults. */
export const GRANTABLE_PORTAL_SECTIONS = [PORTAL_SECTIONS.SECURITY];

const FULL_PORTAL_ACCESS = [
  PORTAL_SECTIONS.ANALYTICS,
  PORTAL_SECTIONS.STUDENTS,
  PORTAL_SECTIONS.ANNOUNCEMENTS,
  PORTAL_SECTIONS.AUDIT_LOGS,
  PORTAL_SECTIONS.DISPATCH,
  PORTAL_SECTIONS.BUG_REPORTS,
];

const LEADERSHIP_PORTAL_ACCESS = [...FULL_PORTAL_ACCESS, PORTAL_SECTIONS.SECURITY];

const INSTRUCTOR_PORTAL_ACCESS = [
  PORTAL_SECTIONS.STUDENTS,
  PORTAL_SECTIONS.ANNOUNCEMENTS,
  PORTAL_SECTIONS.DISPATCH,
  PORTAL_SECTIONS.BUG_REPORTS,
];

/** Portal sections each org role may access (union when multiple roles assigned). */
export const ORG_ROLE_PORTAL_ACCESS = {
  FOUNDER: LEADERSHIP_PORTAL_ACCESS,
  COFOUNDER: LEADERSHIP_PORTAL_ACCESS,
  CTO: FULL_PORTAL_ACCESS,
  CPO: FULL_PORTAL_ACCESS,
  INSTRUCTOR: INSTRUCTOR_PORTAL_ACCESS,
};

const ROLE_ALIASES = {
  "CO-FOUNDER": "COFOUNDER",
  CO_FOUNDER: "COFOUNDER",
  COFOUNDER: "COFOUNDER",
  FOUNDER: "FOUNDER",
  CTO: "CTO",
  CPO: "CPO",
  INSTRUCTOR: "INSTRUCTOR",
};

export function normalizeAdminOrgRole(role) {
  const key = String(role).trim().toUpperCase().replace(/\s+/g, "");
  return ROLE_ALIASES[key] ?? null;
}

export function isValidAdminOrgRole(role) {
  return ALL_ADMIN_ORG_ROLE_KEYS.includes(role);
}

export function isAssignableAdminOrgRole(role) {
  return ASSIGNABLE_ADMIN_ORG_ROLES.includes(role);
}

export function normalizeAdminOrgRoles(roles) {
  if (!Array.isArray(roles)) return [];
  return [
    ...new Set(
      roles.map(normalizeAdminOrgRole).filter((r) => r && isValidAdminOrgRole(r))
    ),
  ];
}

export function getPortalSectionsForOrgRoles(roles) {
  const sections = new Set();
  for (const role of roles ?? []) {
    for (const section of ORG_ROLE_PORTAL_ACCESS[role] ?? []) {
      sections.add(section);
    }
  }
  return [...sections];
}

export function normalizePortalSections(sections) {
  if (!Array.isArray(sections)) return [];
  return [
    ...new Set(
      sections.filter((section) => GRANTABLE_PORTAL_SECTIONS.includes(section))
    ),
  ];
}

export function adminHasPortalSection(admin, section) {
  if (!admin) return false;
  if (admin.isSuperAdmin) return true;
  const fromRoles = getPortalSectionsForOrgRoles(admin.roles);
  if (fromRoles.includes(section)) return true;
  const extras = normalizePortalSections(admin.portalSections);
  return extras.includes(section);
}

/** @deprecated use adminHasPortalSection — kept for route middleware param names */
export function adminHasPortalRole(admin, section) {
  return adminHasPortalSection(admin, section);
}
