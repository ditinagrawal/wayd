import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { WebsitesView } from "@/features/websites/components/websites-view";
import { auth } from "@/lib/auth";

export default async function WebsitesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/auth");
  }
  return <WebsitesView />;
}
