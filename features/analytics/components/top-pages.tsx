"use client";

import { FileTextIcon } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsPages } from "@/features/analytics/hooks/use-analytics";

interface TopPagesProps {
  websiteId: string;
  period: string;
}

export const TopPages = ({ websiteId, period }: TopPagesProps) => {
  const { data, isLoading } = useAnalyticsPages(websiteId, period);

  if (isLoading) {
    return (
      <div className="ring-foreground/10 bg-card overflow-hidden rounded-2xl ring-1">
        <div className="p-6">
          <Skeleton className="mb-4 h-5 w-32" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const pages = data?.pages ?? [];
  const maxViews = pages[0]?.views ?? 1;

  return (
    <div className="ring-foreground/10 bg-card overflow-hidden rounded-2xl ring-1">
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-center gap-2">
          <FileTextIcon className="text-muted-foreground size-4" />
          <h3 className="text-sm font-semibold">Top Pages</h3>
        </div>
      </div>

      <div className="px-6 pb-5">
        {pages.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed">
            <p className="text-muted-foreground text-sm">No page data yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between pb-1">
              <span className="text-muted-foreground text-xs font-medium">
                Page
              </span>
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground w-16 text-right text-xs font-medium">
                  Visitors
                </span>
                <span className="text-muted-foreground w-12 text-right text-xs font-medium">
                  Views
                </span>
              </div>
            </div>

            {pages.map((page) => {
              const percentage = (page.views / maxViews) * 100;
              return (
                <div key={page.pathname} className="group relative">
                  <div className="relative z-10 flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2.5">
                      <FileTextIcon className="text-muted-foreground size-3.5" />
                      <span className="max-w-[200px] truncate text-sm font-medium">
                        {page.pathname}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground w-16 text-right text-xs tabular-nums">
                        {page.visitors}
                      </span>
                      <span className="w-12 text-right text-xs font-semibold tabular-nums">
                        {page.views}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={percentage}
                    className="absolute inset-0 h-full rounded-lg opacity-[0.08]"
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
