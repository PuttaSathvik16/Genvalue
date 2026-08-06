"use client";

import { useCallback, useEffect, useState } from "react";
import { ActivityHeatmap } from "@/components/dashboard/ActivityHeatmap";
import { StudentPlannerPanel } from "@/components/dashboard/StudentPlannerPanel";
import { fetchActivityHeatmap } from "@/services/studentPlannerService";
import type { ActivityHeatmap as ActivityHeatmapData } from "@/types/studentPlanner";

export function StudentActivityPlannerSection() {
  const [heatmap, setHeatmap] = useState<ActivityHeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadHeatmap = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchActivityHeatmap();
      setHeatmap(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load activity data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHeatmap();
  }, [loadHeatmap, refreshKey]);

  const handlePlannerChange = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <section className="space-y-6" aria-labelledby="activity-planner-heading">
      <div>
        <span className="font-annotation text-xs font-bold uppercase tracking-widest text-[#1E3FE0] dark:text-[#60A5FA]">
          ★ ACTIVITY & PLANNING
        </span>
        <h2
          id="activity-planner-heading"
          className="font-display-custom mt-1 text-xl font-extrabold text-[#2A2A28] dark:text-white sm:text-2xl"
        >
          Track progress & plan your week
        </h2>
        <p className="mt-1 text-xs font-medium text-[#6B6558] dark:text-slate-400 sm:text-sm">
          GitHub-style activity map plus a personal study calendar — lessons, quizzes, and your
          daily plans all in one place.
        </p>
      </div>

      {error ? (
        <div
          className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {loading && !heatmap ? (
        <div className="h-48 animate-pulse rounded-3xl border border-black/10 bg-[#F6F1E4] dark:border-white/10 dark:bg-[#0D1B2A]" />
      ) : heatmap ? (
        <ActivityHeatmap data={heatmap} />
      ) : null}

      <StudentPlannerPanel onDataChange={handlePlannerChange} />
    </section>
  );
}
