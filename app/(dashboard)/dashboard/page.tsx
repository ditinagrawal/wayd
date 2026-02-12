import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/auth");
  }
  return (
    <section className="flex h-full flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Dashboard</h1>
    </section>
  );
}
