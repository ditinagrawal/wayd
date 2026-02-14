"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalytics } from "@/features/analytics/hooks/use-analytics";

const chartConfig = {
  views: {
    label: "Page Views",
    color: "var(--chart-2)",
  },
  visitors: {
    label: "Visitors",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface AnalyticsChartProps {
  websiteId: string;
  period: string;
}

export const AnalyticsChart = ({ websiteId, period }: AnalyticsChartProps) => {
  const { data, isLoading } = useAnalytics(websiteId, period);

  if (isLoading) {
    return (
      <div className="ring-foreground/10 bg-card overflow-hidden rounded-2xl ring-1">
        <div className="p-6">
          <Skeleton className="mb-4 h-5 w-40" />
          <Skeleton className="h-[280px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const chartData = data?.chartData ?? [];
  const totals = data?.totals;

  return (
    <div className="ring-foreground/10 bg-card overflow-hidden rounded-2xl ring-1">
      {/* Summary stats */}
      <div className="bg-border/50 grid grid-cols-2 gap-px sm:grid-cols-5">
        <div className="bg-card flex flex-col gap-1 px-6 py-4">
          <span className="text-muted-foreground text-xs font-medium">
            Page Views
          </span>
          <span className="text-xl font-bold tracking-tight tabular-nums">
            {totals?.pageViews?.toLocaleString() ?? "0"}
          </span>
        </div>
        <div className="bg-card flex flex-col gap-1 px-6 py-4">
          <span className="text-muted-foreground text-xs font-medium">
            Unique Visitors
          </span>
          <span className="text-xl font-bold tracking-tight tabular-nums">
            {totals?.visitors?.toLocaleString() ?? "0"}
          </span>
        </div>
        <div className="bg-card flex flex-col gap-1 px-6 py-4">
          <span className="text-muted-foreground text-xs font-medium">
            Sessions
          </span>
          <span className="text-xl font-bold tracking-tight tabular-nums">
            {totals?.sessions?.toLocaleString() ?? "0"}
          </span>
        </div>
        <div className="bg-card flex flex-col gap-1 px-6 py-4">
          <span className="text-muted-foreground text-xs font-medium">
            Avg. Duration
          </span>
          <span className="text-xl font-bold tracking-tight tabular-nums">
            {formatDuration(totals?.avgDuration ?? 0)}
          </span>
        </div>
        <div className="bg-card col-span-2 flex flex-col gap-1 px-6 py-4 sm:col-span-1">
          <span className="text-muted-foreground text-xs font-medium">
            Bounce Rate
          </span>
          <span className="text-xl font-bold tracking-tight tabular-nums">
            {totals?.bounceRate ?? 0}%
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Traffic Overview</h3>
          <Tabs defaultValue="both" className="h-auto">
            <TabsList className="h-7 rounded-lg">
              <TabsTrigger
                value="both"
                className="h-6 rounded-md px-2 text-[11px]"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="views"
                className="h-6 rounded-md px-2 text-[11px]"
              >
                Views
              </TabsTrigger>
              <TabsTrigger
                value="visitors"
                className="h-6 rounded-md px-2 text-[11px]"
              >
                Visitors
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {chartData.length === 0 ? (
          <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed">
            <p className="text-muted-foreground text-sm">
              No data yet. Install the tracking script to start collecting
              analytics.
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-views)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-views)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-visitors)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-visitors)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(val) => formatDateLabel(val, period)}
                className="text-[11px]"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={40}
                className="text-[11px]"
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={{ stroke: "var(--border)" }}
              />
              <Area
                dataKey="visitors"
                type="monotone"
                fill="url(#fillVisitors)"
                stroke="var(--color-visitors)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
              <Area
                dataKey="views"
                type="monotone"
                fill="url(#fillViews)"
                stroke="var(--color-views)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2 }}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </div>
    </div>
  );
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function formatDateLabel(value: string, period: string): string {
  if (period === "24h") {
    // "2025-01-15 14:00" -> "14:00"
    const parts = value.split(" ");
    return parts[1] || value;
  }
  // "2025-01-15" -> "Jan 15"
  try {
    const date = new Date(value);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return value;
  }
}
