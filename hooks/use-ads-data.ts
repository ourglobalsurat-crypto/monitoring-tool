"use client";

import { useEffect, useState } from "react";
import type { AdsData, DateRangeValue } from "@/types/dashboard";

type AdsPayload = {
  range: DateRangeValue;
  generatedAt: string;
  ads: AdsData | null;
  error?: string;
};

type State = {
  data: AdsPayload | null;
  isLoading: boolean;
  error: string | null;
};

export function useAdsData(range: DateRangeValue) {
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
        const response = await fetch(`/api/ads?range=${range}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const payload = (await response.json()) as AdsPayload;

        setState({
          data: payload,
          isLoading: false,
          error: response.ok ? null : payload.error ?? "Google Ads data could not be loaded.",
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({
          data: null,
          isLoading: false,
          error: error instanceof Error ? error.message : "Google Ads data could not be loaded.",
        });
      }
    }

    load();
    return () => controller.abort();
  }, [range]);

  return state;
}
