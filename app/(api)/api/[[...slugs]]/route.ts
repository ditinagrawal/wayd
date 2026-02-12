import { Elysia } from "elysia";

import { auth } from "@/lib/auth";

const betterAuth = new Elysia({ name: "better-auth" })
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        });

        if (!session) return status(401);

        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });

const message = new Elysia({ prefix: "/message" }).get(
  "/",
  () => "Hello Nextjs"
);

const app = new Elysia({ prefix: "/api" }).use(betterAuth).use(message);

export const GET = app.fetch;
export const POST = app.fetch;

export type App = typeof app;
