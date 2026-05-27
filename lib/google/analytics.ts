import { google } from "googleapis";
import { chartLabel, getDateWindows } from "@/lib/date-ranges";
import { percentChange } from "@/lib/utils";
import type { AnalyticsData, ConversionMetric, DateRangeValue, MetricPoint, NamedMetric } from "@/types/dashboard";
import { getGoogleAuth } from "./auth";

const eventLabels: Record<ConversionMetric["eventName"], string> = {
  emails: "Email Leads",
  Form: "Form Submissions",
  click_call: "Phone Calls",
};

type RunReportResponse = {
  rows?: Array<{
    dimensionValues?: Array<{ value?: string | null }>;
    metricValues?: Array<{ value?: string | null }>;
  }>;
};

function metricValue(row: NonNullable<RunReportResponse["rows"]>[number] | undefined, index: number) {
  return Number(row?.metricValues?.[index]?.value ?? 0);
}

function dimensionValue(row: NonNullable<RunReportResponse["rows"]>[number], index: number) {
  return row.dimensionValues?.[index]?.value ?? "Unknown";
}

function normalizeDate(value: string) {
  if (value.length === 8) return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  return value;
}

async function runReport(propertyId: string, requestBody: Record<string, unknown>) {
  const auth = getGoogleAuth();
  const analyticsData = google.analyticsdata({ version: "v1beta", auth });
  const response = await analyticsData.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody,
  });
  return response.data as RunReportResponse;
}

async function optionalRunReport(propertyId: string, requestBody: Record<string, unknown>) {
  try {
    return await runReport(propertyId, requestBody);
  } catch {
    return { rows: [] } satisfies RunReportResponse;
  }
}

async function fetchPeriod(propertyId: string, startDate: string, endDate: string) {
  const organicFilter = {
    filter: {
      fieldName: "sessionDefaultChannelGroup",
      stringFilter: {
        matchType: "EXACT",
        value: "Organic Search",
      },
    },
  };

  const [
    summary,
    traffic,
    organicSummary,
    organicLandingPages,
    searchOverview,
    searchLandingPages,
    devices,
    conversions,
    trends,
    organicTrends,
    searchTrends,
  ] = await Promise.all([
    runReport(propertyId, {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "engagedSessions" },
        { name: "averageSessionDuration" },
      ],
    }),
    runReport(propertyId, {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }, { name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 8,
    }),
    runReport(propertyId, {
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: "sessions" }, { name: "activeUsers" }],
      dimensionFilter: organicFilter,
    }),
    runReport(propertyId, {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "landingPagePlusQueryString" }],
      metrics: [{ name: "sessions" }, { name: "activeUsers" }],
      dimensionFilter: organicFilter,
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 8,
    }),
    optionalRunReport(propertyId, {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: "organicGoogleSearchClicks" },
        { name: "organicGoogleSearchImpressions" },
        { name: "organicGoogleSearchClickThroughRate" },
        { name: "organicGoogleSearchAveragePosition" },
      ],
    }),
    optionalRunReport(propertyId, {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "landingPagePlusQueryString" }],
      metrics: [
        { name: "organicGoogleSearchClicks" },
        { name: "organicGoogleSearchImpressions" },
        { name: "organicGoogleSearchAveragePosition" },
      ],
      orderBys: [{ metric: { metricName: "organicGoogleSearchClicks" }, desc: true }],
      limit: 8,
    }),
    runReport(propertyId, {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    }),
    runReport(propertyId, {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          inListFilter: {
            values: Object.keys(eventLabels),
          },
        },
      },
    }),
    runReport(propertyId, {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
    runReport(propertyId, {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "sessions" }],
      dimensionFilter: organicFilter,
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
    optionalRunReport(propertyId, {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "organicGoogleSearchClicks" }, { name: "organicGoogleSearchImpressions" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
  ]);

  const summaryRow = summary.rows?.[0];
  const conversionRows = conversions.rows ?? [];
  const conversionMetrics = Object.entries(eventLabels).map(([eventName, label]) => {
    const row = conversionRows.find((item) => dimensionValue(item, 0) === eventName);
    return {
      eventName: eventName as ConversionMetric["eventName"],
      label,
      count: metricValue(row, 0),
    };
  });

  const organicTrendMap = new Map(
    (organicTrends.rows ?? []).map((row) => [normalizeDate(dimensionValue(row, 0)), metricValue(row, 0)]),
  );
  const searchTrendMap = new Map(
    (searchTrends.rows ?? []).map((row) => [
      normalizeDate(dimensionValue(row, 0)),
      {
        clicks: metricValue(row, 0),
        impressions: metricValue(row, 1),
      },
    ]),
  );

  const trendPoints: MetricPoint[] = (trends.rows ?? []).map((row) => {
    const date = normalizeDate(dimensionValue(row, 0));
    const searchPoint = searchTrendMap.get(date);
    return {
      date,
      label: chartLabel(date),
      users: metricValue(row, 0),
      sessions: metricValue(row, 1),
      organicSessions: organicTrendMap.get(date) ?? 0,
      searchClicks: searchPoint?.clicks ?? 0,
      searchImpressions: searchPoint?.impressions ?? 0,
      leads: 0,
    };
  });

  return {
    users: metricValue(summaryRow, 0),
    sessions: metricValue(summaryRow, 1),
    engagedSessions: metricValue(summaryRow, 2),
    averageEngagementTime: metricValue(summaryRow, 3),
    trafficSources: (traffic.rows ?? []).map<NamedMetric>((row) => ({
      name: dimensionValue(row, 0),
      value: metricValue(row, 0),
      helper: `${metricValue(row, 1).toLocaleString()} users`,
    })),
    organicSessions: metricValue(organicSummary.rows?.[0], 0),
    organicLandingPages: (organicLandingPages.rows ?? []).map<NamedMetric>((row) => ({
      name: dimensionValue(row, 0) || "/",
      value: metricValue(row, 0),
      helper: `${metricValue(row, 1).toLocaleString()} organic users`,
    })),
    searchClicks: metricValue(searchOverview.rows?.[0], 0),
    searchImpressions: metricValue(searchOverview.rows?.[0], 1),
    searchCtr: metricValue(searchOverview.rows?.[0], 2),
    searchAveragePosition: metricValue(searchOverview.rows?.[0], 3),
    searchLandingPages: (searchLandingPages.rows ?? []).map<NamedMetric>((row) => ({
      name: dimensionValue(row, 0) || "/",
      value: metricValue(row, 0),
      helper: `${metricValue(row, 1).toLocaleString()} impressions | avg. position ${metricValue(row, 2).toFixed(1)}`,
    })),
    deviceCategories: (devices.rows ?? []).map<NamedMetric>((row) => ({
      name: dimensionValue(row, 0).replace(/^\w/, (letter) => letter.toUpperCase()),
      value: metricValue(row, 0),
    })),
    conversions: conversionMetrics,
    trends: trendPoints,
  };
}

export async function getAnalyticsData(range: DateRangeValue): Promise<AnalyticsData> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) throw new Error("GA4_PROPERTY_ID is not configured.");

  const windows = getDateWindows(range);
  const [current, previous] = await Promise.all([
    fetchPeriod(propertyId, windows.current.startDate, windows.current.endDate),
    fetchPeriod(propertyId, windows.previous.startDate, windows.previous.endDate),
  ]);

  const previousLeads = previous.conversions.reduce((sum, event) => sum + event.count, 0);

  return {
    ...current,
    previous: {
      users: previous.users,
      sessions: previous.sessions,
      engagedSessions: previous.engagedSessions,
      organicSessions: previous.organicSessions,
      searchClicks: previous.searchClicks,
      searchImpressions: previous.searchImpressions,
      searchCtr: previous.searchCtr,
      searchAveragePosition: previous.searchAveragePosition,
      leads: previousLeads,
    },
  };
}

export function analyticsHighlights(data: AnalyticsData) {
  const leads = data.conversions.reduce((sum, event) => sum + event.count, 0);
  return [
    `Website visitors are ${percentChange(data.users, data.previous.users).toFixed(1)}% compared to the previous period.`,
    `${leads.toLocaleString()} client actions were tracked from calls, forms, and email clicks.`,
    `${data.trafficSources[0]?.name ?? "Direct"} is currently the strongest traffic source.`,
  ];
}
