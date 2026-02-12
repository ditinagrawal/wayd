"use client";

import { useTransition } from "react";

import { GoogleSVG } from "@/components/svg";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";

export const GoogleBtn = () => {
  const [isPending, startTransition] = useTransition();
  function handleLogin() {
    startTransition(async () => {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    });
  }
  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full cursor-pointer"
      onClick={handleLogin}
      disabled={isPending}
    >
      {isPending ? (
        <Spinner />
      ) : (
        <>
          <GoogleSVG className="mr-2 size-4" />
          Continue with Google
        </>
      )}
    </Button>
  );
};
