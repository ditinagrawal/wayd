"use client";

import { usePathname } from "next/navigation";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { UserProfile } from "@/features/auth/components/user-profile";

export const AppHeader = () => {
  const pathname = usePathname();
  return (
    <div className="flex items-center justify-between border-b px-4 py-2.5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage className="capitalize">
            {pathname.split("/").pop()}
          </BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>
      <UserProfile />
    </div>
  );
};
