"use client";

import { useMemo, useState } from "react";
import type { ActivityHeatmap, HeatmapDay } from "@/types/studentPlanner";
import { HEATMAP_LEVEL_CLASSES } from "@/types/studentPlanner";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildWeekGrid(days: HeatmapDay[]) {
  if (days.length === 0) return [] as (HeatmapDay | null)[][];

  const weeks: (HeatmapDay | null)[][] = [];
  let week: (HeatmapDay | null)[] = [];

  const first = new Date(`${days[0].date}T12:00:00`);
  for (let i = 0; i < first.getDay(); i += 1) {
    week.push(null);
  }

  for (const day of days) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  return weeks;
}

function monthLabelsForWeeks(weeks: (HeatmapDay | null)[][]) {
  const labels: { weekIndex: number; label: string }[] = [];
  let lastMonth = -1;

  weeks.forEach((week, weekIndex) => {
    const firstDay = week.find((d) => d !== null);
    if (!firstDay) return;
    const date = new Date(`${firstDay.date}T12:00:00`);
    const month = date.getMonth();
    if (month !== lastMonth) {
      labels.push({
        weekIndex,
        label: date.toLocaleString(undefined, { month: "short" }),
      });
      lastMonth = month;
    }
  });

  return labels;
}

interface ActivityHeatmapProps {
  data: ActivityHeatmap;
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const [hovered, setHovered] = useState<HeatmapDay | null>(null);

  const weeks = useMemo(() => buildWeekGrid(data.days), [data.days]);
  const monthLabels = useMemo(() => monthLabelsForWeeks(weeks), [weeks]);

  return (
    <div className="rounded-3xl border border-black/10 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display-custom text-lg font-extrabold text-[#2A2A28] dark:text-white">
            Learning activity
          </h2>
          <p className="mt-1 text-xs font-medium text-[#6B6558] dark:text-slate-400">
            {data.totalContributions} contributions in the last year · {data.activeDays} active days
          </p>
        </div>
        <div className="flex gap-4 text-center sm:text-right">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">
              Current streak
            </p>
            <p className="font-display-custom text-2xl font-extrabold text-[#10B981]">
              {data.currentStreak}d
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">
              Best streak
            </p>
            <p className="font-display-custom text-2xl font-extrabold text-[#1E3FE0] dark:text-[#60A5FA]">
              {data.longestStreak}d
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto pb-2">
        <div className="min-w-[640px]">
          <div className="relative mb-2 h-4 pl-8">
            {monthLabels.map(({ weekIndex, label }) => (
              <span
                key={`${label}-${weekIndex}`}
                className="absolute text-[10px] font-semibold text-[#6B6558] dark:text-slate-400"
                style={{ left: `${32 + weekIndex * 14}px` }}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="flex gap-1">
            <div className="flex w-7 flex-col gap-1 pt-0.5 text-[9px] font-bold text-[#6B6558] dark:text-slate-400">
              {DAY_LABELS.map((label, index) => (
                <span
                  key={label}
                  className={`h-[11px] leading-[11px] ${index % 2 === 1 ? "opacity-100" : "opacity-0 sm:opacity-100"}`}
                >
                  {index % 2 === 1 ? label.slice(0, 1) : ""}
                </span>
              ))}
            </div>

            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) =>
                    day ? (
                      <button
                        key={day.date}
                        type="button"
                        aria-label={`${day.date}: ${day.count} activities`}
                        onMouseEnter={() => setHovered(day)}
                        onFocus={() => setHovered(day)}
                        onMouseLeave={() => setHovered(null)}
                        onBlur={() => setHovered(null)}
                        className={`h-[11px] w-[11px] rounded-sm transition hover:ring-2 hover:ring-[#1E3FE0]/40 dark:hover:ring-[#60A5FA]/40 ${HEATMAP_LEVEL_CLASSES[day.level]}`}
                      />
                    ) : (
                      <span
                        key={`empty-${weekIndex}-${dayIndex}`}
                        className="h-[11px] w-[11px]"
                        aria-hidden="true"
                      />
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-medium text-[#6B6558] dark:text-slate-400">
          {hovered
            ? `${hovered.count} activity${hovered.count === 1 ? "" : "ies"} on ${new Date(`${hovered.date}T12:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`
            : "Hover a square to see daily activity"}
        </p>
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#6B6558] dark:text-slate-400">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className={`h-[11px] w-[11px] rounded-sm ${HEATMAP_LEVEL_CLASSES[level]}`}
              aria-hidden="true"
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
