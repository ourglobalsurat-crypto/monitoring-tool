import type { DateRangeValue } from "@/types/dashboard";

const daysByRange: Record<DateRangeValue, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

function toApiDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function normalizeRange(value: string | null): DateRangeValue {
  if (value === "7d" || value === "30d" || value === "90d") return value;
  return "30d";
}

export function getDateWindows(range: DateRangeValue) {
  const days = daysByRange[range];
  const today = new Date();

  const currentEnd = new Date(today);
  currentEnd.setDate(today.getDate() - 1);

  const currentStart = new Date(currentEnd);
  currentStart.setDate(currentEnd.getDate() - days + 1);

  const previousEnd = new Date(currentStart);
  previousEnd.setDate(currentStart.getDate() - 1);

  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousEnd.getDate() - days + 1);

  return {
    days,
    current: {
      startDate: toApiDate(currentStart),
      endDate: toApiDate(currentEnd),
    },
    previous: {
      startDate: toApiDate(previousStart),
      endDate: toApiDate(previousEnd),
    },
  };
}

export function chartLabel(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
