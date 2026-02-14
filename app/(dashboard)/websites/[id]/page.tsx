import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { WebsiteDetailView } from "@/features/websites/components/website-detail-view";
import { auth } from "@/lib/auth";

interface WebsiteDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function WebsiteDetailPage({
  params,
}: WebsiteDetailPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/auth");
  }

  const { id } = await params;

  return <WebsiteDetailView id={id} />;
}
