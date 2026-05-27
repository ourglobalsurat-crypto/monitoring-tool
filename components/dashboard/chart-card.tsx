"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { MetricPoint, NamedMetric } from "@/types/dashboard";
import { formatNumber } from "@/lib/utils";

const colors = ["#0E4D92", "#16865A", "#B7791F", "#C2415B", "#475569", "#38BDF8"];

function TooltipBox({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-border bg-white px-3 py-2 text-sm shadow-soft">
      <p className="font-semibold text-slate-950">{label}</p>
      {payload.map((item) => (
        <p key={item.name} className="mt-1 text-slate-600">
          {item.name}: {formatNumber(item.value)}
        </p>
      ))}
    </div>
  );
}

export function TrendChart({
  title,
  description,
  data,
  lines,
}: {
  title: string;
  description: string;
  data: MetricPoint[];
  lines: Array<{ key: keyof MetricPoint; name: string; color?: string }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
              <defs>
                {lines.map((line, index) => (
                  <linearGradient key={String(line.key)} id={`fill-${String(line.key)}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={line.color ?? colors[index]} stopOpacity={0.22} />
                    <stop offset="95%" stopColor={line.color ?? colors[index]} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} minTickGap={22} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => formatNumber(Number(value))} />
              <Tooltip content={<TooltipBox />} />
              {lines.map((line, index) => (
                <Area
                  key={String(line.key)}
                  type="monotone"
                  dataKey={line.key}
                  name={line.name}
                  stroke={line.color ?? colors[index]}
                  fill={`url(#fill-${String(line.key)})`}
                  strokeWidth={2.4}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function BarMetricChart({
  title,
  description,
  data,
  valueLabel = "Value",
}: {
  title: string;
  description: string;
  data: NamedMetric[];
  valueLabel?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 12, bottom: 0 }}>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#475569" }}
              />
              <Tooltip content={<TooltipBox />} />
              <Bar dataKey="value" name={valueLabel} radius={[0, 6, 6, 0]} fill="#0E4D92" barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function DonutChartCard({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: NamedMetric[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-[1fr_1.1fr] sm:items-center">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={56} outerRadius={84} paddingAngle={3}>
                  {data.map((entry, index) => (
                    <Cell key={entry.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<TooltipBox />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2 text-slate-600">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="font-semibold text-slate-950">{formatNumber(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
