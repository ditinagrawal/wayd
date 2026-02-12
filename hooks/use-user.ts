"use client";

import { authClient } from "@/lib/auth-client";

export const useUser = () => {
  const { data, isPending } = authClient.useSession();
  return { user: data?.user, isPending };
};
