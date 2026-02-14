"use client";

import { useQuery } from "@tanstack/react-query";

import { eden } from "@/config/eden";

export const useAnalytics = (id: string | undefined, period: string = "7d") => {
  return useQuery({
    queryKey: ["analytics", id, period],
    queryFn: async () => {
      const res = await (eden.websites as any)({ id: id! }).analytics.get({
        query: { period },
      });
      if (res.error) throw new Error("Failed to fetch analytics");
      return res.data as {
        chartData: Array<{
          date: string;
          views: number;
          visitors: number;
          sessions: number;
        }>;
        totals: {
          pageViews: number;
          visitors: number;
          sessions: number;
          avgDuration: number;
          bounceRate: number;
        };
      };
    },
    enabled: !!id,
    refetchInterval: 60_000, // Refresh every minute
  });
};

export const useAnalyticsPages = (
  id: string | undefined,
  period: string = "7d"
) => {
  return useQuery({
    queryKey: ["analytics-pages", id, period],
    queryFn: async () => {
      const res = await (eden.websites as any)({ id: id! }).analytics.pages.get(
        { query: { period } }
      );
      if (res.error) throw new Error("Failed to fetch pages analytics");
      return res.data as {
        pages: Array<{ pathname: string; views: number; visitors: number }>;
      };
    },
    enabled: !!id,
  });
};

export const useAnalyticsLocations = (
  id: string | undefined,
  period: string = "7d"
) => {
  return useQuery({
    queryKey: ["analytics-locations", id, period],
    queryFn: async () => {
      const res = await (eden.websites as any)({
        id: id!,
      }).analytics.locations.get({ query: { period } });
      if (res.error) throw new Error("Failed to fetch locations");
      return res.data as {
        countries: Array<{
          country: string;
          views: number;
          visitors: number;
        }>;
        cities: Array<{
          city: string;
          country: string;
          views: number;
          visitors: number;
        }>;
      };
    },
    enabled: !!id,
  });
};

export const useAnalyticsDevices = (
  id: string | undefined,
  period: string = "7d"
) => {
  return useQuery({
    queryKey: ["analytics-devices", id, period],
    queryFn: async () => {
      const res = await (eden.websites as any)({
        id: id!,
      }).analytics.devices.get({ query: { period } });
      if (res.error) throw new Error("Failed to fetch devices");
      return res.data as {
        browsers: Array<{ name: string; views: number; visitors: number }>;
        operatingSystems: Array<{
          name: string;
          views: number;
          visitors: number;
        }>;
        devices: Array<{ name: string; views: number; visitors: number }>;
      };
    },
    enabled: !!id,
  });
};

export const useAnalyticsSources = (
  id: string | undefined,
  period: string = "7d"
) => {
  return useQuery({
    queryKey: ["analytics-sources", id, period],
    queryFn: async () => {
      const res = await (eden.websites as any)({
        id: id!,
      }).analytics.sources.get({ query: { period } });
      if (res.error) throw new Error("Failed to fetch sources");
      return res.data as {
        sources: Array<{ source: string; views: number; visitors: number }>;
        mediums: Array<{ medium: string; views: number; visitors: number }>;
      };
    },
    enabled: !!id,
  });
};

export const useLiveVisitors = (id: string | undefined) => {
  return useQuery({
    queryKey: ["live-visitors", id],
    queryFn: async () => {
      const res = await (eden.websites as any)({
        id: id!,
      }).analytics.live.get();
      if (res.error) throw new Error("Failed to fetch live visitors");
      return res.data as {
        count: number;
        visitors: Array<{
          visitorId: string;
          pathname: string;
          country: string | null;
          device: string | null;
          browser: string | null;
          lastSeen: string;
        }>;
      };
    },
    enabled: !!id,
    refetchInterval: 15_000, // Refresh every 15 seconds
  });
};
