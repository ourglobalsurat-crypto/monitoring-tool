"use client";

import { useEffect, useState } from "react";
import type { AnalyticsData, DateRangeValue } from "@/types/dashboard";

type AnalyticsPayload = {
  range: DateRangeValue;
  generatedAt: string;
  analytics: AnalyticsData | null;
  error?: string;
};

type State = {
  data: AnalyticsPayload | null;
  isLoading: boolean;
  error: string | null;
};

export function useAnalyticsData(range: DateRangeValue) {
  const [state, setState] = useState<State>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setState((current) => ({ ...current, isLoading: true, error: null }));

      try {
        const response = await fetch(`/api/analytics?range=${range}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const payload = (await response.json()) as AnalyticsPayload;

        setState({
          data: payload,
          isLoading: false,
          error: response.ok ? null : payload.error ?? "Google Analytics data could not be loaded.",
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({
          data: null,
          isLoading: false,
          error: error instanceof Error ? error.message : "Google Analytics data could not be loaded.",
        });
      }
    }

    load();
    return () => controller.abort();
  }, [range]);

  return state;
}
