"use client";

import { ExternalLinkIcon, LinkIcon } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalyticsSources } from "@/features/analytics/hooks/use-analytics";

interface SourcesViewProps {
  websiteId: string;
  period: string;
}

export const SourcesView = ({ websiteId, period }: SourcesViewProps) => {
  const { data, isLoading } = useAnalyticsSources(websiteId, period);

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

  const sources = data?.sources ?? [];
  const mediums = data?.mediums ?? [];
  const maxSourceViews = sources[0]?.views ?? 1;
  const maxMediumViews = mediums[0]?.views ?? 1;

  return (
    <div className="ring-foreground/10 bg-card overflow-hidden rounded-2xl ring-1">
      <div className="px-6 pt-5 pb-2">
        <div className="flex items-center gap-2">
          <ExternalLinkIcon className="text-muted-foreground size-4" />
          <h3 className="text-sm font-semibold">Traffic Sources</h3>
        </div>
      </div>

      <Tabs defaultValue="sources" className="px-6 pb-5">
        <TabsList className="mb-3 h-7 rounded-lg">
          <TabsTrigger
            value="sources"
            className="h-6 rounded-md px-2 text-[11px]"
          >
            Sources
          </TabsTrigger>
          <TabsTrigger
            value="mediums"
            className="h-6 rounded-md px-2 text-[11px]"
          >
            Mediums
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sources">
          {sources.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2">
              {sources.map((s) => (
                <SourceRow
                  key={s.source}
                  label={s.source}
                  icon={
                    s.source === "Direct" ? (
                      <LinkIcon className="text-muted-foreground size-3.5" />
                    ) : (
                      <ExternalLinkIcon className="text-muted-foreground size-3.5" />
                    )
                  }
                  views={s.views}
                  visitors={s.visitors}
                  maxViews={maxSourceViews}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mediums">
          {mediums.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2">
              {mediums.map((m) => (
                <SourceRow
                  key={m.medium}
                  label={m.medium}
                  icon={<LinkIcon className="text-muted-foreground size-3.5" />}
                  views={m.views}
                  visitors={m.visitors}
                  maxViews={maxMediumViews}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

function SourceRow({
  label,
  icon,
  views,
  visitors,
  maxViews,
}: {
  label: string;
  icon: React.ReactNode;
  views: number;
  visitors: number;
  maxViews: number;
}) {
  const percentage = (views / maxViews) * 100;
  return (
    <div className="group relative">
      <div className="relative z-10 flex items-center justify-between py-1.5">
        <div className="flex items-center gap-2.5">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground w-16 text-right text-xs tabular-nums">
            {visitors} visitor{visitors !== 1 ? "s" : ""}
          </span>
          <span className="w-12 text-right text-xs font-semibold tabular-nums">
            {views}
          </span>
        </div>
      </div>
      <Progress
        value={percentage}
        className="absolute inset-0 h-full rounded-lg opacity-[0.08]"
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-32 items-center justify-center rounded-xl border border-dashed">
      <p className="text-muted-foreground text-sm">No source data yet</p>
    </div>
  );
}
