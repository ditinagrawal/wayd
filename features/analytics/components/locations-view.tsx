"use client";

import { GlobeIcon, MapPinIcon } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalyticsLocations } from "@/features/analytics/hooks/use-analytics";

interface LocationsViewProps {
  websiteId: string;
  period: string;
}

export const LocationsView = ({ websiteId, period }: LocationsViewProps) => {
  const { data, isLoading } = useAnalyticsLocations(websiteId, period);

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

  const countries = data?.countries ?? [];
  const cities = data?.cities ?? [];
  const maxCountryViews = countries[0]?.views ?? 1;
  const maxCityViews = cities[0]?.views ?? 1;

  return (
    <div className="ring-foreground/10 bg-card overflow-hidden rounded-2xl ring-1">
      <div className="px-6 pt-5 pb-2">
        <div className="flex items-center gap-2">
          <MapPinIcon className="text-muted-foreground size-4" />
          <h3 className="text-sm font-semibold">Locations</h3>
        </div>
      </div>

      <Tabs defaultValue="countries" className="px-6 pb-5">
        <TabsList className="mb-3 h-7 rounded-lg">
          <TabsTrigger
            value="countries"
            className="h-6 rounded-md px-2 text-[11px]"
          >
            Countries
          </TabsTrigger>
          <TabsTrigger
            value="cities"
            className="h-6 rounded-md px-2 text-[11px]"
          >
            Cities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="countries">
          {countries.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2">
              {countries.map((c) => (
                <LocationRow
                  key={c.country}
                  label={c.country}
                  icon={
                    <GlobeIcon className="text-muted-foreground size-3.5" />
                  }
                  views={c.views}
                  visitors={c.visitors}
                  maxViews={maxCountryViews}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cities">
          {cities.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2">
              {cities.map((c) => (
                <LocationRow
                  key={`${c.city}-${c.country}`}
                  label={c.city}
                  sublabel={c.country}
                  icon={
                    <MapPinIcon className="text-muted-foreground size-3.5" />
                  }
                  views={c.views}
                  visitors={c.visitors}
                  maxViews={maxCityViews}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

function LocationRow({
  label,
  sublabel,
  icon,
  views,
  visitors,
  maxViews,
}: {
  label: string;
  sublabel?: string;
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
          {sublabel && (
            <span className="text-muted-foreground text-xs">{sublabel}</span>
          )}
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
      <p className="text-muted-foreground text-sm">No location data yet</p>
    </div>
  );
}
