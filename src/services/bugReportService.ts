import { API_URL, wrapBackendFetchError } from "@/lib/api";
import { ensurePortalAuthToken } from "@/lib/portalAuth";
import { getAdminAuthHeaders } from "@/services/adminService";
import type {
  BugReport,
  BugReportCategory,
  BugReportListMeta,
  BugReportStatus,
} from "@/types/bugReport";

export async function submitBugReport(input: {
  category: BugReportCategory;
  title: string;
  description: string;
  pageUrl?: string;
  screenshotBase64?: string;
}): Promise<{ id: string; status: string; createdAt: string }> {
  const token = await ensurePortalAuthToken();
  if (!token) {
    throw new Error("Please sign in again to submit a bug report.");
  }

  const response = await fetch(`${API_URL}/bug-reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to submit bug report");
  }

  return data.data;
}

export async function listAdminBugReports(
  status?: BugReportStatus
): Promise<{ reports: BugReport[]; meta: BugReportListMeta }> {
  try {
    const qs = status ? `?status=${encodeURIComponent(status)}` : "";
    const response = await fetch(`${API_URL}/admin/bug-reports${qs}`, {
      headers: getAdminAuthHeaders(),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to load bug reports");
    }

    return { reports: data.data ?? [], meta: data.meta };
  } catch (err) {
    throw wrapBackendFetchError(err, "Failed to load bug reports");
  }
}

export async function updateAdminBugReport(
  id: string,
  input: { status: BugReportStatus; adminNotes?: string | null }
): Promise<BugReport> {
  const response = await fetch(`${API_URL}/admin/bug-reports/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: getAdminAuthHeaders(),
    body: JSON.stringify(input),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update bug report");
  }

  return data.data;
}
