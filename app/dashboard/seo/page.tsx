"use client";

import { useMemo, useState } from "react";
import { DateRangeSelector } from "@/components/dashboard/date-range-selector";
import { DashboardSkeleton } from "@/components/dashboard/loading-state";
import { ErrorBanner } from "@/components/dashboard/error-banner";
import { EmptyState } from "@/components/dashboard/empty-state";
import { MetricCard } from "@/components/dashboard/metric-card";
import { TrendChart, BarMetricChart, DonutChartCard } from "@/components/dashboard/chart-card";
import { RankedList } from "@/components/dashboard/ranked-list";
import { InsightList } from "@/components/dashboard/insight-list";
import { useAnalyticsData } from "@/hooks/use-analytics-data";
import { formatDuration, percentChange } from "@/lib/utils";
import type { DateRangeValue, NamedMetric } from "@/types/dashboard";

function findOrganicSource(sources: NamedMetric[]) {
  return sources.find((source) => source.name.toLowerCase().includes("organic")) ?? null;
}

export default function SeoPerformancePage() {
  const [range, setRange] = useState<DateRangeValue>("30d");
  const { data, isLoading, error } = useAnalyticsData(range);
  const analytics = data?.analytics;

  const leads = analytics?.conversions.reduce((sum, event) => sum + event.count, 0) ?? 0;
  const organicSource = analytics ? findOrganicSource(analytics.trafficSources) : null;
  const organicSessions = organicSource?.value ?? 0;
  const organicShare = analytics?.sessions ? organicSessions / analytics.sessions : 0;

  const insights = useMemo(() => {
    if (!analytics) return [];

    const sessionChange = percentChange(analytics.sessions, analytics.previous.sessions);
    const topChannel = analytics.trafficSources[0]?.name ?? "the leading channel";

    return [
      `${topChannel} is currently the strongest traffic source in Google Analytics.`,
      `Overall website sessions are ${Math.abs(sessionChange).toFixed(1)}% ${sessionChange >= 0 ? "higher" : "lower"} than the previous period.`,
      organicSource
        ? `Organic traffic represents ${(organicShare * 100).toFixed(1)}% of all sessions in this date range.`
        : "Organic Search has not appeared as a top channel in this date range yet.",
    ];
  }, [analytics, organicShare, organicSource]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">SEO Performance</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">Organic traffic snapshot</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Google Analytics view of organic visibility, visitor quality, and lead activity.
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
              message="Confirm GA4_PROPERTY_ID, GOOGLE_CLIENT_EMAIL, and GOOGLE_PRIVATE_KEY are set and the service account has access to the GA4 property."
            />
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="Organic Sessions"
                  value={organicSessions}
                  helper="Sessions attributed to Organic Search in GA4."
                  change={percentChange(analytics.sessions, analytics.previous.sessions)}
                />
                <MetricCard
                  label="Organic Share"
                  value={organicShare}
                  helper="Organic Search share of all sessions."
                  format="percent"
                />
                <MetricCard
                  label="Engaged Visits"
                  value={analytics.engagedSessions}
                  helper="Visits with meaningful website activity."
                  change={percentChange(analytics.engagedSessions, analytics.previous.engagedSessions)}
                />
                <MetricCard
                  label="SEO Leads"
                  value={leads}
                  helper="Tracked calls, forms, and email clicks."
                  change={percentChange(leads, analytics.previous.leads)}
                />
              </div>

              <InsightList insights={insights} />

              <TrendChart
                title="Traffic Trend"
                description="Daily visitors and sessions from Google Analytics."
                data={analytics.trends}
                lines={[
                  { key: "users", name: "Visitors", color: "#0E4D92" },
                  { key: "sessions", name: "Sessions", color: "#16865A" },
                ]}
              />

              <div className="grid gap-4 xl:grid-cols-2">
                <BarMetricChart
                  title="Channel Performance"
                  description="How SEO compares with other website traffic sources."
                  data={analytics.trafficSources}
                  valueLabel="Sessions"
                />
                <DonutChartCard
                  title="Device Breakdown"
                  description="Devices used by visitors in this reporting period."
                  data={analytics.deviceCategories}
                />
              </div>

              <RankedList
                title="SEO Lead Actions"
                description={`Average engagement time: ${formatDuration(analytics.averageEngagementTime)}.`}
                data={analytics.conversions.map((event) => ({
                  name: event.label,
                  value: event.count,
                  helper: event.eventName,
                }))}
                valueLabel="Actions"
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
