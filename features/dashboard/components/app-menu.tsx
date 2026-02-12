import Link from "next/link";
import { usePathname } from "next/navigation";

import { LayoutDashboardIcon, LucideIcon, SettingsIcon } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface AppMenuItem {
  id: string;
  title: string;
  icon: LucideIcon;
  link: string;
}

const ITEMS: AppMenuItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboardIcon,
    link: "/dashboard",
  },
  {
    id: "settings",
    title: "Settings",
    icon: SettingsIcon,
    link: "/settings",
  },
];

export const AppMenu = () => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const pathname = usePathname();
  const isActive = (link: string) => pathname === link;

  return (
    <SidebarMenu>
      {ITEMS.map((item) => (
        <SidebarMenuItem key={item.id}>
          <SidebarMenuButton
            tooltip={item.title}
            asChild
            isActive={isActive(item.link)}
          >
            <Link
              href={item.link}
              prefetch={true}
              className={cn(
                "text-muted-foreground hover:bg-sidebar-muted hover:text-foreground flex items-center rounded-lg px-2 transition-colors",
                isCollapsed && "justify-center"
              )}
            >
              <item.icon className="size-4" />
              {!isCollapsed && (
                <span className="ml-2 text-sm font-medium">{item.title}</span>
              )}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};
