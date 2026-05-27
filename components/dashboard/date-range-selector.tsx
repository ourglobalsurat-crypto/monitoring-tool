"use client";

import type { DateRangeValue } from "@/types/dashboard";
import { cn } from "@/lib/utils";

const ranges: Array<{ value: DateRangeValue; label: string }> = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];

export function DateRangeSelector({
  value,
  onChange,
}: {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
}) {
  return (
    <div className="inline-flex h-10 rounded-md border border-border bg-white p-1 shadow-sm">
      {ranges.map((range) => (
        <button
          key={range.value}
          type="button"
          onClick={() => onChange(range.value)}
          className={cn(
            "rounded px-3 text-sm font-semibold text-slate-600 transition-colors",
            value === range.value && "bg-primary text-white shadow-sm",
          )}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
