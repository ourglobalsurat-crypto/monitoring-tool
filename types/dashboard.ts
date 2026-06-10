export type DateRangeValue = "7d" | "30d" | "90d";

export type MetricPoint = {
  date: string;
  label: string;
  users?: number;
  sessions?: number;
  organicSessions?: number;
  searchClicks?: number;
  searchImpressions?: number;
  leads?: number;
  adCost?: number;
  adClicks?: number;
  paidLeads?: number;
};

export type NamedMetric = {
  name: string;
  value: number;
  helper?: string;
};

export type ConversionMetric = {
  eventName: "emails" | "Form" | "click_call";
  label: string;
  count: number;
};

export type AdsData = {
  hasCostData: boolean;
  adCost: number;
  adClicks: number;
  adImpressions: number;
  adCtr: number;
  costPerClick: number;
  paidSessions: number;
  paidUsers: number;
  paidLeads: number;
  costPerLead: number;
  conversionRate: number;
  conversions: ConversionMetric[];
  campaigns: NamedMetric[];
  trends: MetricPoint[];
  previous: {
    adCost: number;
    adClicks: number;
    adImpressions: number;
    paidSessions: number;
    paidLeads: number;
    costPerLead: number;
  };
};

export type AnalyticsData = {
  users: number;
  sessions: number;
  engagedSessions: number;
  averageEngagementTime: number;
  trafficSources: NamedMetric[];
  organicSessions: number;
  organicLandingPages: NamedMetric[];
  searchClicks: number;
  searchImpressions: number;
  searchCtr: number;
  searchAveragePosition: number;
  searchLandingPages: NamedMetric[];
  deviceCategories: NamedMetric[];
  conversions: ConversionMetric[];
  trends: MetricPoint[];
  previous: {
    users: number;
    sessions: number;
    engagedSessions: number;
    organicSessions: number;
    searchClicks: number;
    searchImpressions: number;
    searchCtr: number;
    searchAveragePosition: number;
    leads: number;
  };
};
