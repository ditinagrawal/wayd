import { Elysia, t } from "elysia";

import { db } from "@/config/db";
import { auth } from "@/lib/auth";

export const websites = new Elysia({ prefix: "/websites" })
  .derive(async ({ status, request: { headers } }) => {
    const session = await auth.api.getSession({ headers });
    if (!session) return status(401);
    return { user: session.user, session: session.session };
  })
  .get("/", async ({ user }) => {
    const sites = await db.website.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return sites;
  })
  .post(
    "/",
    async ({ user, body, status }) => {
      const existing = await db.website.findFirst({
        where: {
          domain: body.domain,
          userId: user.id,
        },
      });

      if (existing) {
        return status(409, { error: "Website already exists" });
      }

      const siteId = crypto.randomUUID().slice(0, 8);

      const website = await db.website.create({
        data: {
          id: crypto.randomUUID(),
          domain: body.domain,
          siteId,
          userId: user.id,
        },
      });

      return website;
    },
    {
      body: t.Object({
        domain: t.String({ minLength: 1 }),
      }),
    }
  )
  .get(
    "/:id",
    async ({ user, params, status }) => {
      const website = await db.website.findFirst({
        where: {
          id: params.id,
          userId: user.id,
        },
      });

      if (!website) {
        return status(404, { error: "Website not found" });
      }

      return website;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  .get(
    "/:id/script",
    async ({ user, params, status }) => {
      const website = await db.website.findFirst({
        where: {
          id: params.id,
          userId: user.id,
        },
      });

      if (!website) {
        return status(404, { error: "Website not found" });
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      const script = `<!-- Wayd Analytics -->
<script defer src="${appUrl}/tracker.js" data-site-id="${website.siteId}"></script>`;

      return {
        script,
        siteId: website.siteId,
        domain: website.domain,
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  );
