"use client";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { eden } from "@/config/eden";

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["message"],
    queryFn: () => eden.message.get(),
  });
  if (isLoading)
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <Spinner className="text-primary size-6" />
      </div>
    );
  return (
    <section className="flex h-full flex-col items-center justify-center gap-y-4">
      <h1 className="text-4xl font-bold">HomePage</h1>
      <div>{data?.data}</div>
      <Button asChild>
        <Link href="/auth">Login</Link>
      </Button>
      <ModeToggle />
    </section>
  );
}
