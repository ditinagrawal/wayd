import { treaty } from "@elysiajs/eden";

import type { App } from "@/app/(api)/api/[[...slugs]]/route";

export const eden = treaty<App>(
  process.env.NEXT_PUBLIC_APP_URL! || "http://localhost:3000"
).api;
