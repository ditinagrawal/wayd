import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardView } from "@/features/websites/components/dashboard-view";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/auth");
  }
  return <DashboardView />;
}
