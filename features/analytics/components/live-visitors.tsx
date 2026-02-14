"use client";

import { formatDistanceToNow } from "date-fns";
import {
  CircleIcon,
  GlobeIcon,
  MonitorIcon,
  SmartphoneIcon,
  UsersIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLiveVisitors } from "@/features/analytics/hooks/use-analytics";

interface LiveVisitorsProps {
  websiteId: string;
}

export const LiveVisitors = ({ websiteId }: LiveVisitorsProps) => {
  const { data, isLoading } = useLiveVisitors(websiteId);

  if (isLoading) {
    return (
      <div className="ring-foreground/10 bg-card overflow-hidden rounded-2xl ring-1">
        <div className="p-6">
          <Skeleton className="mb-4 h-5 w-32" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const count = data?.count ?? 0;
  const visitors = data?.visitors ?? [];

  return (
    <div className="ring-foreground/10 bg-card overflow-hidden rounded-2xl ring-1">
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <div className="flex items-center gap-2">
          <UsersIcon className="text-muted-foreground size-4" />
          <h3 className="text-sm font-semibold">Live Visitors</h3>
        </div>
        <Badge
          variant="outline"
          className="gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700"
        >
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
          </span>
          {count} online
        </Badge>
      </div>

      <div className="px-6 pb-5">
        {visitors.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-xl border border-dashed">
            <div className="flex flex-col items-center gap-1.5">
              <CircleIcon className="text-muted-foreground size-5" />
              <p className="text-muted-foreground text-sm">
                No active visitors right now
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {visitors.map((v) => (
              <div
                key={v.visitorId}
                className="hover:bg-muted/50 flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex size-8 items-center justify-center rounded-full">
                    {v.device === "mobile" ? (
                      <SmartphoneIcon className="text-primary size-3.5" />
                    ) : (
                      <MonitorIcon className="text-primary size-3.5" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{v.pathname}</span>
                    <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                      {v.country && (
                        <>
                          <GlobeIcon className="size-3" />
                          <span>{v.country}</span>
                          <span className="text-border">|</span>
                        </>
                      )}
                      <span>{v.browser || "Unknown"}</span>
                    </div>
                  </div>
                </div>
                <span className="text-muted-foreground text-xs">
                  {formatDistanceToNow(new Date(v.lastSeen), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
