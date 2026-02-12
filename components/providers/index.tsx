"use client";

import { TooltipProvider } from "@/components/ui/tooltip";

import { TanstackProvider } from "./tanstack";

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <TooltipProvider>
      <TanstackProvider>{children}</TanstackProvider>
    </TooltipProvider>
  );
};
