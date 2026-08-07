"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaLock,
  FaPen,
  FaPlus,
  FaShieldHalved,
  FaTrash,
  FaUserShield,
} from "react-icons/fa6";
import {
  addAuthorizedAdmin,
  getAdminPortalSettings,
  getAdminProfile,
  listAuthorizedAdmins,
  removeAuthorizedAdmin,
  updateAdminPortalSettings,
  updateAuthorizedAdmin,
  type AdminOrgRoleKey,
  type AdminPortalSettings,
  type AuthorizedAdmin,
} from "@/services/adminService";
import {
  ADMIN_ORG_ROLE_CHECKLIST,
  GRANTABLE_PORTAL_SECTION_LABELS,
  adminHasPortalSection,
  getFirstAllowedAdminHref,
  getOrgRoleLabel,
  rolesGrantSecurityAccess,
  type PortalSectionKey,
} from "@/lib/adminRoles";
import { useAdminPortalPath } from "@/hooks/useAdminPortalPath";
import { ListItemsSkeleton } from "@/components/skeletons";

export default function AuthorizedAdminsPage() {
  const router = useRouter();
  const { sessionId } = useAdminPortalPath();
  const [admins, setAdmins] = useState<AuthorizedAdmin[]>([]);
  const [portalSettings, setPortalSettings] = useState<AdminPortalSettings | null>(null);
  const [adminEmailLimit, setAdminEmailLimit] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingLimit, setSavingLimit] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<AdminOrgRoleKey[]>(["CTO"]);
  const [userLimit, setUserLimit] = useState("");
  const [grantSuperAdmin, setGrantSuperAdmin] = useState(false);
  const [grantSecurityAccess, setGrantSecurityAccess] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AuthorizedAdmin | null>(null);
  const [editRoles, setEditRoles] = useState<AdminOrgRoleKey[]>([]);
  const [editUserLimit, setEditUserLimit] = useState("");
  const [editGrantSuperAdmin, setEditGrantSuperAdmin] = useState(false);
  const [editGrantSecurityAccess, setEditGrantSecurityAccess] = useState(false);

  const loadPageData = async () => {
    try {
      setLoading(true);
      setError("");
      const [adminList, settings] = await Promise.all([
        listAuthorizedAdmins(),
        getAdminPortalSettings(),
      ]);
      setAdmins(adminList);
      setPortalSettings(settings);
      setAdminEmailLimit(String(settings.maxAuthorizedAdmins));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load authorized admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAdminProfile().then((profile) => {
      if (!profile?.isSuperAdmin) {
        router.replace(getFirstAllowedAdminHref(profile, sessionId));
        return;
      }
      loadPageData();
    });
  }, [router, sessionId]);

  const buildPortalSections = (
    roles: AdminOrgRoleKey[],
    securityGranted: boolean,
    isSuperAdmin: boolean
  ): PortalSectionKey[] => {
    if (isSuperAdmin || rolesGrantSecurityAccess(roles)) return [];
    return securityGranted ? ["SECURITY"] : [];
  };

  const adminCanViewSecurity = (admin: AuthorizedAdmin): boolean =>
    adminHasPortalSection(
      {
        isSuperAdmin: admin.isSuperAdmin,
        roles: admin.roles,
        portalSections: admin.portalSections,
      },
      "SECURITY"
    );

  const isPrimarySuperAdmin = (admin: AuthorizedAdmin): boolean =>
    admin.isSuperAdmin && admin.addedByEmail === "system";

  const toggleRole = (
    role: AdminOrgRoleKey,
    current: AdminOrgRoleKey[],
    setter: (roles: AdminOrgRoleKey[]) => void
  ) => {
    setter(current.includes(role) ? current.filter((r) => r !== role) : [...current, role]);
  };

  const parseUserLimitInput = (value: string): number | null => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new Error("Student limit must be a positive whole number");
    }
    return parsed;
  };

  const handleSaveAdminLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLimit(true);
    setError("");
    setSuccess("");

    try {
      const parsed = Number(adminEmailLimit);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) {
        throw new Error("Admin email limit must be between 1 and 100");
      }

      const settings = await updateAdminPortalSettings(parsed);
      setPortalSettings(settings);
      setAdminEmailLimit(String(settings.maxAuthorizedAdmins));
      setSuccess(`Admin email limit set to ${settings.maxAuthorizedAdmins}.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update admin email limit");
    } finally {
      setSavingLimit(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      if (!grantSuperAdmin && selectedRoles.length === 0) {
        throw new Error("Select at least one role or grant super admin access");
      }

      if (!grantSuperAdmin && portalSettings && portalSettings.remainingSlots <= 0) {
        throw new Error(
          `Admin email limit reached (${portalSettings.maxAuthorizedAdmins}). Increase the limit or revoke an admin first.`
        );
      }

      const limit = grantSuperAdmin ? null : parseUserLimitInput(userLimit);

      const result = await addAuthorizedAdmin(email, {
        name: name || undefined,
        roles: grantSuperAdmin ? ["CTO"] : selectedRoles,
        userLimit: limit,
        isSuperAdmin: grantSuperAdmin,
        portalSections: buildPortalSections(selectedRoles, grantSecurityAccess, grantSuperAdmin),
      });

      setEmail("");
      setName("");
      setSelectedRoles(["CTO"]);
      setUserLimit("");
      setGrantSuperAdmin(false);
      setGrantSecurityAccess(false);
      setSuccess(
        result.emailSent
          ? `Access granted to ${email.trim().toLowerCase()}. A GenValue welcome email was sent.`
          : `Access granted to ${email.trim().toLowerCase()}, but the welcome email could not be sent. Check Brevo settings.`
      );
      await loadPageData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add admin");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (adminEmail: string) => {
    if (!confirm(`Revoke admin access for ${adminEmail}?`)) return;

    try {
      setError("");
      await removeAuthorizedAdmin(adminEmail);
      setSuccess(`Access revoked for ${adminEmail}`);
      await loadPageData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to revoke access");
    }
  };

  const openEdit = (admin: AuthorizedAdmin) => {
    setEditingAdmin(admin);
    setEditRoles(admin.roles ?? []);
    setEditUserLimit(admin.userLimit != null ? String(admin.userLimit) : "");
    setEditGrantSuperAdmin(admin.isSuperAdmin);
    setEditGrantSecurityAccess((admin.portalSections ?? []).includes("SECURITY"));
    setError("");
    setSuccess("");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      if (!editGrantSuperAdmin && editRoles.length === 0) {
        throw new Error("Select at least one role or keep super admin access");
      }

      const limit = editGrantSuperAdmin ? null : parseUserLimitInput(editUserLimit);

      await updateAuthorizedAdmin(editingAdmin.email, {
        roles: editGrantSuperAdmin ? ["CTO"] : editRoles,
        userLimit: limit,
        isSuperAdmin: editGrantSuperAdmin,
        portalSections: buildPortalSections(editRoles, editGrantSecurityAccess, editGrantSuperAdmin),
      });

      setSuccess(`Updated permissions for ${editingAdmin.email}`);
      setEditingAdmin(null);
      await loadPageData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update admin");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-black/10 bg-white/60 px-4 py-3 text-sm font-medium text-[#2A2A28] outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-[#60A5FA]";

  const RoleCheckboxGroup = ({
    roles,
    selected,
    onToggle,
    idPrefix,
    disabled = false,
  }: {
    roles: typeof ADMIN_ORG_ROLE_CHECKLIST;
    selected: AdminOrgRoleKey[];
    onToggle: (role: AdminOrgRoleKey) => void;
    idPrefix: string;
    disabled?: boolean;
  }) => (
    <div className="grid gap-2 sm:grid-cols-2">
      {roles.map((role) => (
        <label
          key={role.key}
          htmlFor={`${idPrefix}-${role.key}`}
          className={`flex items-center gap-3 rounded-xl border border-black/10 bg-white/40 px-4 py-3 transition dark:border-white/10 dark:bg-white/5 ${
            disabled
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer hover:border-[#1E3FE0]/30 dark:hover:border-[#60A5FA]/30"
          }`}
        >
          <input
            id={`${idPrefix}-${role.key}`}
            type="checkbox"
            checked={selected.includes(role.key)}
            disabled={disabled}
            onChange={() => onToggle(role.key)}
            aria-label={`Assign ${role.label} role`}
            className="h-4 w-4 rounded border-black/20 accent-[#1E3FE0]"
          />
          <span className="text-sm font-semibold text-[#2A2A28] dark:text-white">{role.label}</span>
        </label>
      ))}
    </div>
  );

  const slotsFull = portalSettings != null && portalSettings.remainingSlots <= 0 && !grantSuperAdmin;

  const PermissionToggle = ({
    id,
    label,
    description,
    checked,
    disabled,
    onChange,
  }: {
    id: string;
    label: string;
    description: string;
    checked: boolean;
    disabled?: boolean;
    onChange: (checked: boolean) => void;
  }) => (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-start gap-3 rounded-xl border border-black/10 bg-white/40 px-4 py-3 transition dark:border-white/10 dark:bg-white/5 ${
        disabled ? "opacity-60" : "hover:border-[#1E3FE0]/30 dark:hover:border-[#60A5FA]/30"
      }`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label}
        className="mt-0.5 h-4 w-4 rounded border-black/20 accent-[#1E3FE0]"
      />
      <span>
        <span className="block text-sm font-semibold text-[#2A2A28] dark:text-white">{label}</span>
        <span className="mt-0.5 block text-[11px] font-medium text-[#6B6558] dark:text-slate-400">
          {description}
        </span>
      </span>
    </label>
  );

  return (
    <div className="space-y-8">
      <div>
        <span className="font-annotation text-xs font-bold uppercase tracking-widest text-[#E8622E]">
          ★ SUPER ADMIN
        </span>
        <h1 className="font-display-custom text-2xl font-extrabold tracking-tight text-[#2A2A28] dark:text-white sm:text-3xl">
          Authorized Admin Emails
        </h1>
        <p className="text-xs font-medium text-[#6B6558] dark:text-slate-400">
          Control who can sign in to the admin portal. Grant super admin access, assign org roles,
          and choose who can view Portal Security. Super admins do not count toward the email limit.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-[#10B981]/20 bg-[#10B981]/10 p-4 text-sm font-bold text-[#10B981]">
          {success}
        </div>
      )}

      {portalSettings && (
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSaveAdminLimit}
          className="rounded-2xl border border-[#E8622E]/20 bg-[#F6F1E4] p-6 shadow-lg dark:border-[#E8622E]/30 dark:bg-[#0D1B2A]"
        >
          <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-[#2A2A28] dark:text-white">
            <FaLock className="h-4 w-4 text-[#E8622E]" />
            Admin Email Limit
          </h2>
          <p className="mb-4 text-xs text-[#6B6558] dark:text-slate-400">
            Maximum authorized admin emails (excluding your super admin account). Only the main
            super admin account can change this number.
          </p>

          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-[140px] max-w-xs flex-1">
              <label
                htmlFor="admin-email-limit"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#6B6558]"
              >
                Max admin emails
              </label>
              <input
                id="admin-email-limit"
                type="number"
                min={1}
                max={100}
                required
                value={adminEmailLimit}
                onChange={(e) => setAdminEmailLimit(e.target.value)}
                disabled={!portalSettings.canEditLimit || savingLimit}
                aria-label="Maximum number of authorized admin email addresses"
                className={inputClass}
              />
            </div>

            <div className="rounded-xl border border-black/10 bg-white/50 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5">
              <p className="font-bold text-[#2A2A28] dark:text-white">
                {portalSettings.activeAdminCount} / {portalSettings.maxAuthorizedAdmins} used
              </p>
              <p className="text-xs text-[#6B6558] dark:text-slate-400">
                {portalSettings.remainingSlots} slot{portalSettings.remainingSlots === 1 ? "" : "s"}{" "}
                remaining
              </p>
            </div>

            {portalSettings.canEditLimit && (
              <button
                type="submit"
                disabled={savingLimit}
                aria-label="Save admin email limit"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#E8622E] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#c44e1f] disabled:opacity-50"
              >
                {savingLimit ? "Saving..." : "Save Limit"}
              </button>
            )}
          </div>
        </motion.form>
      )}

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleAdd}
        className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-6 shadow-lg dark:border-white/10 dark:bg-[#0D1B2A]"
      >
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#2A2A28] dark:text-white">
          <FaPlus className="h-4 w-4 text-[#1E3FE0]" />
          Add Admin Email
        </h2>

        {slotsFull && (
          <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs font-semibold text-amber-700 dark:text-amber-300">
            Admin email limit reached. Revoke an admin or increase the limit above before adding a
            new email.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="new-admin-email" className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#6B6558]">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="new-admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              aria-label="New admin email"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="new-admin-name" className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#6B6558]">
              Name (optional)
            </label>
            <input
              id="new-admin-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              aria-label="Admin name"
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#6B6558]">
            Roles {!grantSuperAdmin && <span className="text-red-500">*</span>}
          </p>
          <RoleCheckboxGroup
            idPrefix="add"
            roles={ADMIN_ORG_ROLE_CHECKLIST}
            selected={selectedRoles}
            onToggle={(role) => toggleRole(role, selectedRoles, setSelectedRoles)}
            disabled={grantSuperAdmin}
          />
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#6B6558]">
            Elevated Access
          </p>
          <PermissionToggle
            id="add-grant-super-admin"
            label="Super Admin"
            description="Full portal access, authorized admin management, and the ability to grant security access to others."
            checked={grantSuperAdmin}
            onChange={(checked) => {
              setGrantSuperAdmin(checked);
              if (checked) setGrantSecurityAccess(false);
            }}
          />
          <PermissionToggle
            id="add-grant-security"
            label={GRANTABLE_PORTAL_SECTION_LABELS.SECURITY}
            description={
              rolesGrantSecurityAccess(selectedRoles)
                ? "Founder and Co-founder roles always include Portal Security."
                : "Allow this admin to view the Security evaluation page and reports."
            }
            checked={grantSecurityAccess || rolesGrantSecurityAccess(selectedRoles) || grantSuperAdmin}
            disabled={
              grantSuperAdmin || rolesGrantSecurityAccess(selectedRoles)
            }
            onChange={setGrantSecurityAccess}
          />
        </div>

        {!grantSuperAdmin && (
        <div className="mt-4 max-w-xs">
          <label htmlFor="new-admin-user-limit" className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#6B6558]">
            Student roster limit (optional)
          </label>
          <input
            id="new-admin-user-limit"
            type="number"
            min={1}
            value={userLimit}
            onChange={(e) => setUserLimit(e.target.value)}
            placeholder="Unlimited"
            aria-label="Maximum students this admin can view in their roster"
            className={inputClass}
          />
          <p className="mt-1 text-[10px] text-[#6B6558] dark:text-slate-400">
            Per-admin cap on students shown in their roster. Leave blank for unlimited.
          </p>
        </div>
        )}

        <button
          type="submit"
          disabled={submitting || slotsFull}
          aria-label="Authorize admin email"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1E3FE0] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#12266E] disabled:opacity-50 dark:bg-[#60A5FA] dark:text-[#070B19]"
        >
          <FaUserShield className="h-4 w-4" />
          {submitting ? "Adding..." : "Authorize Email"}
        </button>
      </motion.form>

      {editingAdmin && (
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleUpdate}
          className="rounded-2xl border border-[#1E3FE0]/30 bg-[#F6F1E4] p-6 shadow-lg dark:border-[#60A5FA]/30 dark:bg-[#0D1B2A]"
        >
          <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-[#2A2A28] dark:text-white">
            <FaPen className="h-4 w-4 text-[#1E3FE0]" />
            Edit Permissions
          </h2>
          <p className="mb-4 text-xs text-[#6B6558] dark:text-slate-400">{editingAdmin.email}</p>

          <RoleCheckboxGroup
            idPrefix="edit"
            roles={ADMIN_ORG_ROLE_CHECKLIST}
            selected={editRoles}
            onToggle={(role) => toggleRole(role, editRoles, setEditRoles)}
            disabled={editGrantSuperAdmin}
          />

          <div className="mt-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#6B6558]">
              Elevated Access
            </p>
            <PermissionToggle
              id="edit-grant-super-admin"
              label="Super Admin"
              description="Full portal access and permission management. At least one super admin must remain."
              checked={editGrantSuperAdmin}
              disabled={editingAdmin ? isPrimarySuperAdmin(editingAdmin) : false}
              onChange={(checked) => {
                setEditGrantSuperAdmin(checked);
                if (checked) setEditGrantSecurityAccess(false);
              }}
            />
            <PermissionToggle
              id="edit-grant-security"
              label={GRANTABLE_PORTAL_SECTION_LABELS.SECURITY}
              description={
                rolesGrantSecurityAccess(editRoles)
                  ? "Founder and Co-founder roles always include Portal Security."
                  : "Allow this admin to view the Security evaluation page and reports."
              }
              checked={
                editGrantSecurityAccess ||
                rolesGrantSecurityAccess(editRoles) ||
                editGrantSuperAdmin
              }
              disabled={
                editGrantSuperAdmin ||
                rolesGrantSecurityAccess(editRoles) ||
                (editingAdmin ? isPrimarySuperAdmin(editingAdmin) && editGrantSuperAdmin : false)
              }
              onChange={setEditGrantSecurityAccess}
            />
          </div>

          {!editGrantSuperAdmin && (
          <div className="mt-4 max-w-xs">
            <label htmlFor="edit-admin-user-limit" className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#6B6558]">
              Student roster limit (optional)
            </label>
            <input
              id="edit-admin-user-limit"
              type="number"
              min={1}
              value={editUserLimit}
              onChange={(e) => setEditUserLimit(e.target.value)}
              placeholder="Unlimited"
              aria-label="Maximum students this admin can view in their roster"
              className={inputClass}
            />
          </div>
          )}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              aria-label="Save admin permissions"
              className="inline-flex items-center gap-2 rounded-full bg-[#1E3FE0] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#12266E] disabled:opacity-50 dark:bg-[#60A5FA] dark:text-[#070B19]"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => setEditingAdmin(null)}
              aria-label="Cancel editing admin permissions"
              className="rounded-full border border-black/10 px-5 py-2.5 text-sm font-bold text-[#6B6558] transition hover:bg-black/5 dark:border-white/10 dark:text-slate-300"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      <div className="rounded-2xl border border-black/10 bg-[#F6F1E4] shadow-lg dark:border-white/10 dark:bg-[#0D1B2A]">
        <div className="border-b border-black/10 px-6 py-4 dark:border-white/10">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#2A2A28] dark:text-white">
            <FaEnvelope className="h-4 w-4 text-[#1E3FE0]" />
            Authorized Emails
          </h2>
        </div>

        {loading ? (
          <div className="p-4">
            <ListItemsSkeleton count={5} />
          </div>
        ) : admins.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#6B6558] dark:text-slate-400">
            No authorized admin emails yet.
          </div>
        ) : (
          <ul className="divide-y divide-black/10 dark:divide-white/10">
            {admins.map((admin) => (
              <li key={admin.id} className="flex flex-wrap items-start justify-between gap-4 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-[#2A2A28] dark:text-white">{admin.email}</p>
                    {admin.isSuperAdmin && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/10 px-2 py-1 text-[10px] font-bold uppercase text-[#10B981]">
                        <FaShieldHalved className="h-3 w-3" />
                        Super Admin
                      </span>
                    )}
                    {!admin.isActive && (
                      <span className="rounded-full bg-red-500/10 px-2 py-1 text-[10px] font-bold uppercase text-red-600">
                        Revoked
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[#6B6558] dark:text-slate-400">
                    {admin.name || "No name"} · Added by {admin.addedByEmail || "system"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(admin.roles ?? []).map((role) => (
                      <span
                        key={role}
                        className="rounded-full bg-[#1E3FE0]/10 px-2 py-0.5 text-[10px] font-bold uppercase text-[#1E3FE0] dark:bg-[#60A5FA]/15 dark:text-[#60A5FA]"
                      >
                        {getOrgRoleLabel(role)}
                      </span>
                    ))}
                    {adminCanViewSecurity(admin) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/10 px-2 py-0.5 text-[10px] font-bold uppercase text-[#10B981]">
                        <FaLock className="h-2.5 w-2.5" />
                        Security
                      </span>
                    )}
                    {!admin.isSuperAdmin && (
                      <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-bold text-[#6B6558] dark:bg-white/10 dark:text-slate-300">
                        Students: {admin.userLimit ?? "Unlimited"}
                      </span>
                    )}
                  </div>
                </div>

                {admin.isActive && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(admin)}
                      aria-label={`Edit permissions for ${admin.email}`}
                      className="inline-flex items-center gap-2 rounded-full border border-[#1E3FE0]/20 px-4 py-2 text-xs font-bold text-[#1E3FE0] transition hover:bg-[#1E3FE0]/10 dark:text-[#60A5FA]"
                    >
                      <FaPen className="h-3 w-3" />
                      Edit
                    </button>
                    {!isPrimarySuperAdmin(admin) && (
                    <button
                      type="button"
                      onClick={() => handleRemove(admin.email)}
                      aria-label={`Revoke access for ${admin.email}`}
                      className="inline-flex items-center gap-2 rounded-full border border-red-500/20 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
                    >
                      <FaTrash className="h-3 w-3" />
                      Revoke
                    </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
