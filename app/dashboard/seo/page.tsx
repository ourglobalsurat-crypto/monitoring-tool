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
import { formatDuration, formatPercent, percentChange } from "@/lib/utils";
import type { DateRangeValue } from "@/types/dashboard";

export default function SeoPerformancePage() {
  const [range, setRange] = useState<DateRangeValue>("30d");
  const { data, isLoading, error } = useAnalyticsData(range);
  const analytics = data?.analytics;

  const leads = analytics?.conversions.reduce((sum, event) => sum + event.count, 0) ?? 0;
  const organicSessions = analytics?.organicSessions ?? 0;
  const organicShare = analytics?.sessions ? organicSessions / analytics.sessions : 0;
  const ctrPointChange = analytics ? (analytics.searchCtr - analytics.previous.searchCtr) * 100 : 0;

  const insights = useMemo(() => {
    if (!analytics) return [];

    const sessionChange = percentChange(analytics.sessions, analytics.previous.sessions);
    const topLandingPage = analytics.searchLandingPages[0]?.name ?? "the strongest organic landing page";

    return [
      `${topLandingPage} is currently the strongest organic landing page in Google Analytics.`,
      `${analytics.searchClicks.toLocaleString()} Google organic clicks came from ${analytics.searchImpressions.toLocaleString()} impressions.`,
      `Overall website sessions are ${Math.abs(sessionChange).toFixed(1)}% ${sessionChange >= 0 ? "higher" : "lower"} than the previous period.`,
      organicSessions
        ? `Organic traffic represents ${(organicShare * 100).toFixed(1)}% of all sessions in this date range.`
        : "Organic Search has not appeared as a top channel in this date range yet.",
    ].slice(0, 4);
  }, [analytics, organicShare, organicSessions]);

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
                  label="Search Clicks"
                  value={analytics.searchClicks}
                  helper="Visits from Google organic search results."
                  change={percentChange(analytics.searchClicks, analytics.previous.searchClicks)}
                />
                <MetricCard
                  label="Impressions"
                  value={analytics.searchImpressions}
                  helper="Times the website appeared in Google organic results."
                  change={percentChange(analytics.searchImpressions, analytics.previous.searchImpressions)}
                />
                <MetricCard
                  label="Avg. Position"
                  value={analytics.searchAveragePosition}
                  helper="Lower numbers mean stronger average visibility."
                  change={
                    analytics.previous.searchAveragePosition
                      ? ((analytics.previous.searchAveragePosition - analytics.searchAveragePosition) /
                          analytics.previous.searchAveragePosition) *
                        100
                      : 0
                  }
                  format="position"
                />
                <MetricCard
                  label="CTR Improvement"
                  value={`${ctrPointChange >= 0 ? "+" : ""}${ctrPointChange.toFixed(1)} pts`}
                  helper={`Current CTR: ${formatPercent(analytics.searchCtr)}. Previous: ${formatPercent(analytics.previous.searchCtr)}.`}
                  change={percentChange(analytics.searchCtr, analytics.previous.searchCtr)}
                />
              </div>

              <InsightList insights={insights} />

              <TrendChart
                title="Google Organic Search Trend"
                description="Daily clicks and impressions from GA4 linked search metrics."
                data={analytics.trends}
                lines={[
                  { key: "searchClicks", name: "Clicks", color: "#0E4D92" },
                  { key: "searchImpressions", name: "Impressions", color: "#16865A" },
                ]}
              />

              <div className="grid gap-4 xl:grid-cols-2">
                <BarMetricChart
                  title="Top Search Landing Pages"
                  description="Pages receiving Google organic clicks in GA4."
                  data={analytics.searchLandingPages}
                  valueLabel="Clicks"
                />
                <DonutChartCard
                  title="Device Breakdown"
                  description="Devices used by visitors in this reporting period."
                  data={analytics.deviceCategories}
                />
              </div>

              <RankedList
                title="Organic Traffic Quality"
                description={`Organic sessions: ${organicSessions.toLocaleString()}. Organic share: ${(organicShare * 100).toFixed(1)}%. Average engagement time: ${formatDuration(analytics.averageEngagementTime)}.`}
                data={[
                  { name: "Organic Sessions", value: analytics.organicSessions, helper: "Sessions attributed to Organic Search in GA4" },
                  { name: "Engaged Visits", value: analytics.engagedSessions, helper: "Visits with meaningful website activity" },
                  { name: "SEO Leads", value: leads, helper: "Tracked calls, forms, and email clicks" },
                ]}
                valueLabel="Total"
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
