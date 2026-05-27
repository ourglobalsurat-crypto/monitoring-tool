"use client";

import { useMemo, useState } from "react";
import { DateRangeSelector } from "@/components/dashboard/date-range-selector";
import { DashboardSkeleton } from "@/components/dashboard/loading-state";
import { ErrorBanner } from "@/components/dashboard/error-banner";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TrendChart, DonutChartCard, BarMetricChart } from "@/components/dashboard/chart-card";
import { RankedList } from "@/components/dashboard/ranked-list";
import { InsightList } from "@/components/dashboard/insight-list";
import { EmptyState } from "@/components/dashboard/empty-state";
import { useAnalyticsData } from "@/hooks/use-analytics-data";
import { formatDuration, percentChange } from "@/lib/utils";
import type { DateRangeValue } from "@/types/dashboard";

export default function OverviewPage() {
  const [range, setRange] = useState<DateRangeValue>("30d");
  const { data, isLoading, error } = useAnalyticsData(range);

  const analytics = data?.analytics;
  const leads = analytics?.conversions.reduce((sum, event) => sum + event.count, 0) ?? 0;
  const engagementRate = analytics?.sessions ? analytics.engagedSessions / analytics.sessions : 0;

  const insights = useMemo(() => {
    if (!analytics) return [];

    const sessionChange = percentChange(analytics.sessions, analytics.previous.sessions);
    const userChange = percentChange(analytics.users, analytics.previous.users);
    const leadChange = percentChange(leads, analytics.previous.leads);
    const topChannel = analytics.trafficSources[0]?.name ?? "your leading traffic channel";

    return [
      `Website sessions are ${Math.abs(sessionChange).toFixed(1)}% ${sessionChange >= 0 ? "higher" : "lower"} than the previous period.`,
      `Visitor volume is ${Math.abs(userChange).toFixed(1)}% ${userChange >= 0 ? "higher" : "lower"} compared with the previous period.`,
      `${leads.toLocaleString()} tracked lead actions came from phone calls, forms, and email clicks.`,
      `${topChannel} is currently the strongest source of website activity.`,
      `Lead actions are ${Math.abs(leadChange).toFixed(1)}% ${leadChange >= 0 ? "higher" : "lower"} than the previous period.`,
    ].slice(0, 4);
  }, [analytics, leads]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">Executive Overview</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">Performance at a glance</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Live Google Analytics reporting for traffic, engagement, and lead activity.
          </p>
        </div>
        <DateRangeSelector value={range} onChange={setRange} />
      </div>

      {isLoading && <DashboardSkeleton />}

      {!isLoading && (
        <>
          <ErrorBanner errors={error ? [error] : []} />

          {!analytics ? (
            <EmptyState
              title="Google Analytics data unavailable"
              message="Confirm GA4_PROPERTY_ID, GOOGLE_CLIENT_EMAIL, and GOOGLE_PRIVATE_KEY are set in Vercel and that the service account has GA4 access."
            />
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="Website Visitors"
                  value={analytics.users}
                  helper="People who visited the website."
                  change={percentChange(analytics.users, analytics.previous.users)}
                />
                <MetricCard
                  label="Sessions"
                  value={analytics.sessions}
                  helper="Total visits to the website."
                  change={percentChange(analytics.sessions, analytics.previous.sessions)}
                />
                <MetricCard
                  label="Engaged Visits"
                  value={analytics.engagedSessions}
                  helper="Visits with meaningful activity."
                  change={percentChange(analytics.engagedSessions, analytics.previous.engagedSessions)}
                />
                <MetricCard
                  label="Tracked Leads"
                  value={leads}
                  helper="Phone calls, forms, and email clicks."
                  change={percentChange(leads, analytics.previous.leads)}
                />
              </div>

              <InsightList insights={insights} />

              <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <TrendChart
                  title="Traffic Trend"
                  description="Daily visitors and sessions from Google Analytics."
                  data={analytics.trends}
                  lines={[
                    { key: "users", name: "Visitors", color: "#0E4D92" },
                    { key: "sessions", name: "Sessions", color: "#B7791F" },
                  ]}
                />
                <DonutChartCard
                  title="Device Mix"
                  description="How visitors are using the website."
                  data={analytics.deviceCategories}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <BarMetricChart
                  title="Traffic Sources"
                  description="Where website sessions are coming from."
                  data={analytics.trafficSources}
                  valueLabel="Sessions"
                />
                <RankedList
                  title="Lead Actions"
                  description={`Average engagement time: ${formatDuration(analytics.averageEngagementTime)}. Engagement rate: ${(engagementRate * 100).toFixed(1)}%.`}
                  data={analytics.conversions.map((event) => ({
                    name: event.label,
                    value: event.count,
                  }))}
                  valueLabel="Actions"
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
