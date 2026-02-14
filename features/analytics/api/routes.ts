import { Elysia, t } from "elysia";

import { db } from "@/config/db";
import { auth } from "@/lib/auth";

// Helper to get date range
function getDateRange(period: string): Date {
  const now = new Date();
  switch (period) {
    case "24h":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
}

export const analytics = new Elysia({ prefix: "/websites" })
  .derive(async ({ status, request: { headers } }) => {
    const session = await auth.api.getSession({ headers });
    if (!session) return status(401);
    return { user: session.user, session: session.session };
  })

  // Main analytics overview: chart data, totals
  .get(
    "/:id/analytics",
    async ({ user, params, query, status }) => {
      const website = await db.website.findFirst({
        where: { id: params.id, userId: user.id },
      });
      if (!website) return status(404, { error: "Website not found" });

      const period = (query?.period as string) || "7d";
      const startDate = getDateRange(period);

      const pageViews = await db.pageView.findMany({
        where: {
          websiteId: website.id,
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: "asc" },
      });

      // Aggregate chart data by day or hour
      const isHourly = period === "24h";
      const chartMap = new Map<
        string,
        { views: number; visitors: Set<string>; sessions: Set<string> }
      >();

      for (const pv of pageViews) {
        const date = new Date(pv.createdAt);
        let key: string;
        if (isHourly) {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:00`;
        } else {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        }

        if (!chartMap.has(key)) {
          chartMap.set(key, {
            views: 0,
            visitors: new Set(),
            sessions: new Set(),
          });
        }
        const entry = chartMap.get(key)!;
        entry.views++;
        entry.visitors.add(pv.visitorId);
        entry.sessions.add(pv.sessionId);
      }

      const chartData = Array.from(chartMap.entries()).map(
        ([date, { views, visitors, sessions }]) => ({
          date,
          views,
          visitors: visitors.size,
          sessions: sessions.size,
        })
      );

      // Totals
      const uniqueVisitors = new Set(pageViews.map((pv) => pv.visitorId));
      const uniqueSessions = new Set(pageViews.map((pv) => pv.sessionId));
      const totalDuration = pageViews.reduce(
        (acc, pv) => acc + (pv.duration || 0),
        0
      );
      const avgDuration =
        uniqueSessions.size > 0
          ? Math.round(totalDuration / uniqueSessions.size)
          : 0;

      // Bounce rate: sessions with only 1 page view
      const sessionPageCounts = new Map<string, number>();
      for (const pv of pageViews) {
        sessionPageCounts.set(
          pv.sessionId,
          (sessionPageCounts.get(pv.sessionId) || 0) + 1
        );
      }
      const bouncedSessions = Array.from(sessionPageCounts.values()).filter(
        (c) => c === 1
      ).length;
      const bounceRate =
        sessionPageCounts.size > 0
          ? Math.round((bouncedSessions / sessionPageCounts.size) * 100)
          : 0;

      return {
        chartData,
        totals: {
          pageViews: pageViews.length,
          visitors: uniqueVisitors.size,
          sessions: uniqueSessions.size,
          avgDuration,
          bounceRate,
        },
      };
    },
    {
      params: t.Object({ id: t.String() }),
      query: t.Optional(t.Object({ period: t.Optional(t.String()) })),
    }
  )

  // Top pages
  .get(
    "/:id/analytics/pages",
    async ({ user, params, query, status }) => {
      const website = await db.website.findFirst({
        where: { id: params.id, userId: user.id },
      });
      if (!website) return status(404, { error: "Website not found" });

      const period = (query?.period as string) || "7d";
      const startDate = getDateRange(period);

      const pageViews = await db.pageView.findMany({
        where: {
          websiteId: website.id,
          createdAt: { gte: startDate },
        },
        select: { pathname: true, visitorId: true },
      });

      const pageMap = new Map<
        string,
        { views: number; visitors: Set<string> }
      >();
      for (const pv of pageViews) {
        if (!pageMap.has(pv.pathname)) {
          pageMap.set(pv.pathname, { views: 0, visitors: new Set() });
        }
        const entry = pageMap.get(pv.pathname)!;
        entry.views++;
        entry.visitors.add(pv.visitorId);
      }

      const pages = Array.from(pageMap.entries())
        .map(([pathname, { views, visitors }]) => ({
          pathname,
          views,
          visitors: visitors.size,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      return { pages };
    },
    {
      params: t.Object({ id: t.String() }),
      query: t.Optional(t.Object({ period: t.Optional(t.String()) })),
    }
  )

  // Locations
  .get(
    "/:id/analytics/locations",
    async ({ user, params, query, status }) => {
      const website = await db.website.findFirst({
        where: { id: params.id, userId: user.id },
      });
      if (!website) return status(404, { error: "Website not found" });

      const period = (query?.period as string) || "7d";
      const startDate = getDateRange(period);

      const pageViews = await db.pageView.findMany({
        where: {
          websiteId: website.id,
          createdAt: { gte: startDate },
          country: { not: null },
        },
        select: { country: true, city: true, region: true, visitorId: true },
      });

      // Countries
      const countryMap = new Map<
        string,
        { views: number; visitors: Set<string> }
      >();
      for (const pv of pageViews) {
        const country = pv.country || "Unknown";
        if (!countryMap.has(country)) {
          countryMap.set(country, { views: 0, visitors: new Set() });
        }
        const entry = countryMap.get(country)!;
        entry.views++;
        entry.visitors.add(pv.visitorId);
      }

      const countries = Array.from(countryMap.entries())
        .map(([country, { views, visitors }]) => ({
          country,
          views,
          visitors: visitors.size,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Cities
      const cityMap = new Map<
        string,
        { views: number; visitors: Set<string>; country: string }
      >();
      for (const pv of pageViews) {
        const city = pv.city || "Unknown";
        if (!cityMap.has(city)) {
          cityMap.set(city, {
            views: 0,
            visitors: new Set(),
            country: pv.country || "Unknown",
          });
        }
        const entry = cityMap.get(city)!;
        entry.views++;
        entry.visitors.add(pv.visitorId);
      }

      const cities = Array.from(cityMap.entries())
        .map(([city, { views, visitors, country }]) => ({
          city,
          country,
          views,
          visitors: visitors.size,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      return { countries, cities };
    },
    {
      params: t.Object({ id: t.String() }),
      query: t.Optional(t.Object({ period: t.Optional(t.String()) })),
    }
  )

  // Devices (browser, OS, device type)
  .get(
    "/:id/analytics/devices",
    async ({ user, params, query, status }) => {
      const website = await db.website.findFirst({
        where: { id: params.id, userId: user.id },
      });
      if (!website) return status(404, { error: "Website not found" });

      const period = (query?.period as string) || "7d";
      const startDate = getDateRange(period);

      const pageViews = await db.pageView.findMany({
        where: {
          websiteId: website.id,
          createdAt: { gte: startDate },
        },
        select: {
          browser: true,
          os: true,
          device: true,
          visitorId: true,
        },
      });

      function aggregate(field: "browser" | "os" | "device") {
        const map = new Map<string, { views: number; visitors: Set<string> }>();
        for (const pv of pageViews) {
          const val = pv[field] || "Unknown";
          if (!map.has(val)) {
            map.set(val, { views: 0, visitors: new Set() });
          }
          const entry = map.get(val)!;
          entry.views++;
          entry.visitors.add(pv.visitorId);
        }
        return Array.from(map.entries())
          .map(([name, { views, visitors }]) => ({
            name,
            views,
            visitors: visitors.size,
          }))
          .sort((a, b) => b.views - a.views);
      }

      return {
        browsers: aggregate("browser"),
        operatingSystems: aggregate("os"),
        devices: aggregate("device"),
      };
    },
    {
      params: t.Object({ id: t.String() }),
      query: t.Optional(t.Object({ period: t.Optional(t.String()) })),
    }
  )

  // Sources (referrers + UTM)
  .get(
    "/:id/analytics/sources",
    async ({ user, params, query, status }) => {
      const website = await db.website.findFirst({
        where: { id: params.id, userId: user.id },
      });
      if (!website) return status(404, { error: "Website not found" });

      const period = (query?.period as string) || "7d";
      const startDate = getDateRange(period);

      const pageViews = await db.pageView.findMany({
        where: {
          websiteId: website.id,
          createdAt: { gte: startDate },
        },
        select: {
          source: true,
          medium: true,
          referrer: true,
          visitorId: true,
        },
      });

      // Traffic sources
      const sourceMap = new Map<
        string,
        { views: number; visitors: Set<string> }
      >();
      for (const pv of pageViews) {
        let src = pv.source || "Direct";
        if (src === "Direct" && pv.referrer) {
          try {
            const url = new URL(pv.referrer);
            src = url.hostname.replace("www.", "");
          } catch {
            // keep Direct
          }
        }
        if (!sourceMap.has(src)) {
          sourceMap.set(src, { views: 0, visitors: new Set() });
        }
        const entry = sourceMap.get(src)!;
        entry.views++;
        entry.visitors.add(pv.visitorId);
      }

      const sources = Array.from(sourceMap.entries())
        .map(([source, { views, visitors }]) => ({
          source,
          views,
          visitors: visitors.size,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Mediums
      const mediumMap = new Map<
        string,
        { views: number; visitors: Set<string> }
      >();
      for (const pv of pageViews) {
        const med = pv.medium || "none";
        if (!mediumMap.has(med)) {
          mediumMap.set(med, { views: 0, visitors: new Set() });
        }
        const entry = mediumMap.get(med)!;
        entry.views++;
        entry.visitors.add(pv.visitorId);
      }

      const mediums = Array.from(mediumMap.entries())
        .map(([medium, { views, visitors }]) => ({
          medium,
          views,
          visitors: visitors.size,
        }))
        .sort((a, b) => b.views - a.views);

      return { sources, mediums };
    },
    {
      params: t.Object({ id: t.String() }),
      query: t.Optional(t.Object({ period: t.Optional(t.String()) })),
    }
  )

  // Live visitors (active in last 5 minutes)
  .get(
    "/:id/analytics/live",
    async ({ user, params, status }) => {
      const website = await db.website.findFirst({
        where: { id: params.id, userId: user.id },
      });
      if (!website) return status(404, { error: "Website not found" });

      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      const recentViews = await db.pageView.findMany({
        where: {
          websiteId: website.id,
          createdAt: { gte: fiveMinutesAgo },
        },
        select: {
          visitorId: true,
          pathname: true,
          country: true,
          device: true,
          browser: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      // Group by visitor, take the most recent page view per visitor
      const visitorMap = new Map<
        string,
        {
          visitorId: string;
          pathname: string;
          country: string | null;
          device: string | null;
          browser: string | null;
          lastSeen: Date;
        }
      >();
      for (const rv of recentViews) {
        if (!visitorMap.has(rv.visitorId)) {
          visitorMap.set(rv.visitorId, {
            visitorId: rv.visitorId,
            pathname: rv.pathname,
            country: rv.country,
            device: rv.device,
            browser: rv.browser,
            lastSeen: rv.createdAt,
          });
        }
      }

      const visitors = Array.from(visitorMap.values());

      return {
        count: visitors.length,
        visitors,
      };
    },
    {
      params: t.Object({ id: t.String() }),
    }
  );
