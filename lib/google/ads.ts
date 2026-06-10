import { google } from "googleapis";
import { chartLabel, getDateWindows } from "@/lib/date-ranges";
import type { AdsData, ConversionMetric, DateRangeValue, MetricPoint, NamedMetric } from "@/types/dashboard";
import { getGoogleAuth } from "./auth";

// Paid (Google Ads) reporting is sourced from the GA4 Data API. Cost/click/impression
// metrics (advertiser*) only return data when the Google Ads account is linked to GA4.
// Conversion events are the same ones tracked sitewide, filtered to Paid Search sessions.
const eventLabels: Record<ConversionMetric["eventName"], string> = {
  emails: "Email Leads",
  Form: "Form Submissions",
  click_call: "Phone Calls",
};

const PAID_CHANNEL = "Paid Search";

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

// Cost metrics are unavailable until the Google Ads <-> GA4 link is enabled, so
// treat failures from those reports as empty instead of breaking the page.
async function optionalRunReport(propertyId: string, requestBody: Record<string, unknown>) {
  try {
    return await runReport(propertyId, requestBody);
  } catch {
    return { rows: [] } satisfies RunReportResponse;
  }
}

const paidChannelFilter = {
  filter: {
    fieldName: "sessionDefaultChannelGroup",
    stringFilter: { matchType: "EXACT", value: PAID_CHANNEL },
  },
};

async function fetchAdsPeriod(propertyId: string, startDate: string, endDate: string) {
  const [costSummary, paidSummary, paidConversions, campaigns, costTrends, paidLeadTrends] = await Promise.all([
    optionalRunReport(propertyId, {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: "advertiserAdCost" },
        { name: "advertiserAdClicks" },
        { name: "advertiserAdImpressions" },
        { name: "advertiserAdCostPerClick" },
      ],
    }),
    runReport(propertyId, {
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: "sessions" }, { name: "activeUsers" }],
      dimensionFilter: paidChannelFilter,
    }),
    runReport(propertyId, {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        andGroup: {
          expressions: [
            { filter: { fieldName: "eventName", inListFilter: { values: Object.keys(eventLabels) } } },
            paidChannelFilter,
          ],
        },
      },
    }),
    optionalRunReport(propertyId, {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "sessionCampaignName" }],
      metrics: [{ name: "advertiserAdCost" }, { name: "advertiserAdClicks" }, { name: "sessions" }],
      dimensionFilter: paidChannelFilter,
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 8,
    }),
    optionalRunReport(propertyId, {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "advertiserAdCost" }, { name: "advertiserAdClicks" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
    runReport(propertyId, {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        andGroup: {
          expressions: [
            { filter: { fieldName: "eventName", inListFilter: { values: Object.keys(eventLabels) } } },
            paidChannelFilter,
          ],
        },
      },
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
  ]);

  const costRow = costSummary.rows?.[0];
  const adCost = metricValue(costRow, 0);
  const adClicks = metricValue(costRow, 1);
  const adImpressions = metricValue(costRow, 2);
  const costPerClick = metricValue(costRow, 3);

  const paidRow = paidSummary.rows?.[0];
  const paidSessions = metricValue(paidRow, 0);
  const paidUsers = metricValue(paidRow, 1);

  const conversionRows = paidConversions.rows ?? [];
  const conversions = Object.entries(eventLabels).map(([eventName, label]) => {
    const row = conversionRows.find((item) => dimensionValue(item, 0) === eventName);
    return {
      eventName: eventName as ConversionMetric["eventName"],
      label,
      count: metricValue(row, 0),
    };
  });
  const paidLeads = conversions.reduce((sum, event) => sum + event.count, 0);

  const costTrendMap = new Map(
    (costTrends.rows ?? []).map((row) => [
      normalizeDate(dimensionValue(row, 0)),
      { cost: metricValue(row, 0), clicks: metricValue(row, 1) },
    ]),
  );

  const trends: MetricPoint[] = (paidLeadTrends.rows ?? []).map((row) => {
    const date = normalizeDate(dimensionValue(row, 0));
    const costPoint = costTrendMap.get(date);
    return {
      date,
      label: chartLabel(date),
      adCost: costPoint?.cost ?? 0,
      adClicks: costPoint?.clicks ?? 0,
      paidLeads: metricValue(row, 0),
    };
  });

  return {
    adCost,
    adClicks,
    adImpressions,
    costPerClick,
    paidSessions,
    paidUsers,
    paidLeads,
    conversions,
    campaigns: (campaigns.rows ?? []).map<NamedMetric>((row) => ({
      name: dimensionValue(row, 0) || "(unattributed)",
      value: metricValue(row, 2),
      helper: `${metricValue(row, 1).toLocaleString()} clicks`,
    })),
    trends,
  };
}

export async function getAdsData(range: DateRangeValue): Promise<AdsData> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) throw new Error("GA4_PROPERTY_ID is not configured.");

  const windows = getDateWindows(range);
  const [current, previous] = await Promise.all([
    fetchAdsPeriod(propertyId, windows.current.startDate, windows.current.endDate),
    fetchAdsPeriod(propertyId, windows.previous.startDate, windows.previous.endDate),
  ]);

  const adCtr = current.adImpressions ? current.adClicks / current.adImpressions : 0;
  const costPerLead = current.paidLeads ? current.adCost / current.paidLeads : 0;
  const previousCostPerLead = previous.paidLeads ? previous.adCost / previous.paidLeads : 0;
  const conversionRate = current.paidSessions ? current.paidLeads / current.paidSessions : 0;
  const hasCostData = current.adCost > 0 || current.adClicks > 0 || current.adImpressions > 0;

  return {
    hasCostData,
    adCost: current.adCost,
    adClicks: current.adClicks,
    adImpressions: current.adImpressions,
    adCtr,
    costPerClick: current.costPerClick,
    paidSessions: current.paidSessions,
    paidUsers: current.paidUsers,
    paidLeads: current.paidLeads,
    costPerLead,
    conversionRate,
    conversions: current.conversions,
    campaigns: current.campaigns,
    trends: current.trends,
    previous: {
      adCost: previous.adCost,
      adClicks: previous.adClicks,
      adImpressions: previous.adImpressions,
      paidSessions: previous.paidSessions,
      paidLeads: previous.paidLeads,
      costPerLead: previousCostPerLead,
    },
  };
}
