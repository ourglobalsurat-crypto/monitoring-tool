"use client";

import { useEffect, useState } from "react";
import type { DashboardPayload, DateRangeValue } from "@/types/dashboard";

type State = {
  data: DashboardPayload | null;
  isLoading: boolean;
  error: string | null;
};

export function useDashboardData(range: DateRangeValue) {
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
        const response = await fetch(`/api/dashboard?range=${range}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const payload = (await response.json()) as DashboardPayload & { error?: string };

        if (!response.ok && !payload) {
          throw new Error("Dashboard data could not be loaded.");
        }

        setState({
          data: payload,
          isLoading: false,
          error: payload.error ?? null,
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        setState({
          data: null,
          isLoading: false,
          error: error instanceof Error ? error.message : "Dashboard data could not be loaded.",
        });
      }
    }

    load();
    return () => controller.abort();
  }, [range]);

  return state;
}
