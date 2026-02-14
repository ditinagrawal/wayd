import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AuthView } from "@/features/auth/components/auth-view";
import { auth } from "@/lib/auth";

export default async function AuthPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) {
    redirect("/websites");
  }
  return <AuthView />;
}
