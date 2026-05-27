"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatNumber } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  helper,
  change,
  format = "number",
}: {
  label: string;
  value: number | string;
  helper: string;
  change?: number;
  format?: "number" | "percent" | "position" | "duration";
}) {
  const positive = typeof change === "number" && change > 0;
  const negative = typeof change === "number" && change < 0;
  const Icon = positive ? ArrowUpRight : negative ? ArrowDownRight : Minus;

  const displayValue =
    typeof value === "string"
      ? value
      : format === "percent"
        ? `${(value * 100).toFixed(1)}%`
        : format === "position"
          ? value.toFixed(1)
          : formatNumber(value);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card className="h-full transition-shadow hover:shadow-soft">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">{displayValue}</p>
            </div>
            {typeof change === "number" && (
              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
                  positive && "bg-emerald-50 text-success",
                  negative && "bg-rose-50 text-rose",
                  !positive && !negative && "bg-slate-100 text-slate-600",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {Math.abs(change).toFixed(1)}%
              </span>
            )}
          </div>
          <p className="mt-3 text-sm leading-5 text-slate-500">{helper}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
