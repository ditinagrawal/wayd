import { cors } from "@elysiajs/cors";
import { Elysia, t } from "elysia";

import { db } from "@/config/db";

// Simple UA parser
function parseUserAgent(ua: string | null) {
  if (!ua) return { browser: null, os: null, device: "desktop" };

  let browser = "Other";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("OPR") || ua.includes("Opera")) browser = "Opera";
  else if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";

  let os = "Other";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux") && !ua.includes("Android")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  let device = "desktop";
  if (ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone"))
    device = "mobile";
  else if (ua.includes("iPad") || ua.includes("Tablet")) device = "tablet";

  return { browser, os, device };
}

// Simple IP-based geo lookup (uses ip-api.com free tier)
async function getGeoFromIP(
  ip: string
): Promise<{
  country: string | null;
  city: string | null;
  region: string | null;
}> {
  const defaultGeo = { country: null, city: null, region: null };
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip === "localhost") {
    return defaultGeo;
  }
  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=country,city,regionName`
    );
    if (!res.ok) return defaultGeo;
    const data = (await res.json()) as {
      country?: string;
      city?: string;
      regionName?: string;
    };
    return {
      country: data.country || null,
      city: data.city || null,
      region: data.regionName || null,
    };
  } catch {
    return defaultGeo;
  }
}

export const collect = new Elysia({ prefix: "/collect" })
  .use(cors({ origin: true, methods: ["POST", "OPTIONS"] }))
  .post(
  "/",
  async ({ body, request }) => {
    const {
      siteId,
      type,
      pathname,
      referrer,
      visitorId,
      sessionId,
      screenWidth,
      source,
      medium,
      campaign,
      duration,
    } = body as {
      siteId: string;
      type?: string;
      pathname?: string;
      referrer?: string | null;
      visitorId: string;
      sessionId: string;
      screenWidth?: number;
      source?: string | null;
      medium?: string | null;
      campaign?: string | null;
      duration?: number;
    };

    // Look up the website
    const website = await db.website.findFirst({
      where: { siteId },
    });

    if (!website) {
      return { ok: false, error: "Site not found" };
    }

    // Handle duration update
    if (type === "duration" && duration && pathname) {
      // Update the most recent page view matching this session + pathname
      const recentView = await db.pageView.findFirst({
        where: {
          websiteId: website.id,
          sessionId,
          visitorId,
          pathname,
        },
        orderBy: { createdAt: "desc" },
      });
      if (recentView) {
        await db.pageView.update({
          where: { id: recentView.id },
          data: { duration },
        });
      }
      return { ok: true };
    }

    // Parse user agent
    const ua = request.headers.get("user-agent");
    const { browser, os, device: deviceType } = parseUserAgent(ua);

    // Get IP for geolocation
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
    const geo = await getGeoFromIP(ip);

    // Create page view
    await db.pageView.create({
      data: {
        pathname: pathname || "/",
        referrer: referrer || null,
        visitorId,
        sessionId,
        browser,
        os,
        device: deviceType,
        country: geo.country,
        city: geo.city,
        region: geo.region,
        source: source || null,
        medium: medium || null,
        campaign: campaign || null,
        websiteId: website.id,
      },
    });

    return { ok: true };
  },
  {
    body: t.Object({
      siteId: t.String(),
      type: t.Optional(t.String()),
      pathname: t.Optional(t.String()),
      referrer: t.Optional(t.Nullable(t.String())),
      visitorId: t.String(),
      sessionId: t.String(),
      screenWidth: t.Optional(t.Number()),
      language: t.Optional(t.String()),
      source: t.Optional(t.Nullable(t.String())),
      medium: t.Optional(t.Nullable(t.String())),
      campaign: t.Optional(t.Nullable(t.String())),
      duration: t.Optional(t.Number()),
    }),
  }
);
