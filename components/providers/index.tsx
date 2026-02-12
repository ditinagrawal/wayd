"use client";

import { TooltipProvider } from "@/components/ui/tooltip";

import { TanstackProvider } from "./tanstack";
import { ThemeProvider } from "./theme";

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <TooltipProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TanstackProvider>{children}</TanstackProvider>
      </ThemeProvider>
    </TooltipProvider>
  );
};
