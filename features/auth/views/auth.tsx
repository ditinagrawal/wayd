import Image from "next/image";
import Link from "next/link";

import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { GoogleBtn } from "../components/google-btn";

export const AuthView = () => {
  return (
    <section className="relative h-full">
      <div className="absolute top-4 left-4 z-10">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeftIcon className="size-4" />
          </Link>
        </Button>
      </div>
      <div className="mx-auto flex h-full w-full max-w-xl flex-col gap-y-6 px-4 py-48">
        <Link href="/" className="w-fit">
          <Image
            src="/logo.svg"
            alt="Wayd"
            width={100}
            height={100}
            className="size-10"
            priority
            draggable={false}
          />
        </Link>
        <div className="flex flex-col gap-y-1">
          <h1 className="text-3xl font-bold">Welcome to Wayd</h1>
          <p className="max-w-xs sm:max-w-none">
            Please login to your account to get started.
          </p>
        </div>
        <div className="my-4">
          <GoogleBtn />
        </div>
        <p className="text-muted-foreground max-w-xs text-sm sm:max-w-none">
          By continuing, you agree to our
          <Link href="/terms" className="mx-1 underline">
            Terms of Service
          </Link>
          and
          <Link href="/privacy" className="ml-1 underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </section>
  );
};
