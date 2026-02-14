import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/features/layout/components/app-header";
import { AppSidebar } from "@/features/layout/components/app-sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="relative flex h-dvh w-full">
        <AppSidebar />
        <SidebarInset className="flex min-h-0 flex-col">
          <AppHeader />
          <div className="min-h-0 flex-1 overflow-auto p-4">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
