"use client";

import Image from "next/image";
import Link from "next/link";

import { motion } from "motion/react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import { AppMenu } from "./app-menu";

export const AppSidebar = () => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader
        className={cn(
          "flex md:pt-3.5",
          isCollapsed
            ? "flex-row items-center justify-between gap-y-4 md:flex-col md:items-start md:justify-start"
            : "flex-row items-center justify-between"
        )}
      >
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="Wayd"
            width={32}
            height={32}
            className="size-8"
            priority
            draggable={false}
          />
          {!isCollapsed && <span className="font-semibold">Wayd</span>}
        </Link>

        <motion.div
          key={isCollapsed ? "header-collapsed" : "header-expanded"}
          className={cn(
            "flex items-center gap-2",
            isCollapsed ? "flex-row md:flex-col-reverse" : "flex-row"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <SidebarTrigger />
        </motion.div>
      </SidebarHeader>
      <SidebarContent className="gap-4 px-2 py-4">
        <AppMenu />
      </SidebarContent>
    </Sidebar>
  );
};
