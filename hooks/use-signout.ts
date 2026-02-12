"use client";

import { useTransition } from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

export const useSignout = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const signOut = () => {
    startTransition(async () => {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
            toast.success("Signed out successfully");
          },
          onError: () => {
            toast.error("Failed to sign out");
          },
        },
      });
    });
  };
  return { isPending, signOut };
};
