import { API_URL, wrapBackendFetchError } from "@/lib/api";
import { ensurePortalAuthToken } from "@/lib/portalAuth";
import type {
  ActivityHeatmap,
  PlannerEvent,
  PlannerInsights,
  PlannerCategory,
} from "@/types/studentPlanner";

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await ensurePortalAuthToken();
  if (!token) throw new Error("Please sign in again.");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchActivityHeatmap(): Promise<ActivityHeatmap> {
  try {
    const response = await fetch(`${API_URL}/dashboard/activity/heatmap`, {
      headers: await getAuthHeaders(),
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to load activity");
    return data.data;
  } catch (err) {
    throw wrapBackendFetchError(err, "Failed to load activity heatmap");
  }
}

export async function fetchPlannerEvents(from: string, to: string): Promise<PlannerEvent[]> {
  try {
    const qs = new URLSearchParams({ from, to });
    const response = await fetch(`${API_URL}/dashboard/planner?${qs}`, {
      headers: await getAuthHeaders(),
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to load planner");
    return data.data ?? [];
  } catch (err) {
    throw wrapBackendFetchError(err, "Failed to load planner events");
  }
}

export async function fetchPlannerInsights(): Promise<PlannerInsights> {
  try {
    const response = await fetch(`${API_URL}/dashboard/planner/insights`, {
      headers: await getAuthHeaders(),
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to load insights");
    return data.data;
  } catch (err) {
    throw wrapBackendFetchError(err, "Failed to load planner insights");
  }
}

export async function createPlannerEvent(input: {
  title: string;
  description?: string;
  category: PlannerCategory;
  scheduledAt: string;
  endAt?: string;
  allDay?: boolean;
}): Promise<PlannerEvent> {
  const response = await fetch(`${API_URL}/dashboard/planner`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(input),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to create plan");
  return data.data;
}

export async function updatePlannerEvent(
  id: string,
  input: Partial<{
    title: string;
    description: string | null;
    category: PlannerCategory;
    scheduledAt: string;
    endAt: string | null;
    allDay: boolean;
    completed: boolean;
  }>
): Promise<PlannerEvent> {
  const response = await fetch(`${API_URL}/dashboard/planner/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: await getAuthHeaders(),
    body: JSON.stringify(input),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to update plan");
  return data.data;
}

export async function deletePlannerEvent(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/dashboard/planner/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: await getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Failed to delete plan");
}
