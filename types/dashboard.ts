export type DateRangeValue = "7d" | "30d" | "90d";

export type MetricPoint = {
  date: string;
  label: string;
  clicks?: number;
  impressions?: number;
  users?: number;
  sessions?: number;
  leads?: number;
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

export type AnalyticsData = {
  users: number;
  sessions: number;
  engagedSessions: number;
  averageEngagementTime: number;
  trafficSources: NamedMetric[];
  deviceCategories: NamedMetric[];
  conversions: ConversionMetric[];
  trends: MetricPoint[];
  previous: {
    users: number;
    sessions: number;
    engagedSessions: number;
    leads: number;
  };
};

export type DashboardPayload = {
  range: DateRangeValue;
  generatedAt: string;
  analytics: AnalyticsData | null;
  errors: string[];
};
