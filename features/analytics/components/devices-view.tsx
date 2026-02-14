"use client";

import {
  ChromeIcon,
  LaptopIcon,
  MonitorIcon,
  SmartphoneIcon,
  TabletIcon,
} from "lucide-react";
import { Cell, Pie, PieChart } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnalyticsDevices } from "@/features/analytics/hooks/use-analytics";

const DEVICE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  desktop: <MonitorIcon className="text-muted-foreground size-3.5" />,
  mobile: <SmartphoneIcon className="text-muted-foreground size-3.5" />,
  tablet: <TabletIcon className="text-muted-foreground size-3.5" />,
};

interface DevicesViewProps {
  websiteId: string;
  period: string;
}

export const DevicesView = ({ websiteId, period }: DevicesViewProps) => {
  const { data, isLoading } = useAnalyticsDevices(websiteId, period);

  if (isLoading) {
    return (
      <div className="ring-foreground/10 bg-card overflow-hidden rounded-2xl ring-1">
        <div className="p-6">
          <Skeleton className="mb-4 h-5 w-32" />
          <Skeleton className="mx-auto mb-4 size-40 rounded-full" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const devices = data?.devices ?? [];
  const browsers = data?.browsers ?? [];
  const operatingSystems = data?.operatingSystems ?? [];
  const totalDeviceViews = devices.reduce((a, d) => a + d.views, 0) || 1;

  const pieData = devices.map((d, i) => ({
    name: d.name,
    value: d.views,
    fill: DEVICE_COLORS[i % DEVICE_COLORS.length],
  }));

  const pieConfig: ChartConfig = {};
  devices.forEach((d, i) => {
    pieConfig[d.name] = {
      label: d.name.charAt(0).toUpperCase() + d.name.slice(1),
      color: DEVICE_COLORS[i % DEVICE_COLORS.length],
    };
  });

  return (
    <div className="ring-foreground/10 bg-card overflow-hidden rounded-2xl ring-1">
      <div className="px-6 pt-5 pb-2">
        <div className="flex items-center gap-2">
          <LaptopIcon className="text-muted-foreground size-4" />
          <h3 className="text-sm font-semibold">Devices</h3>
        </div>
      </div>

      <Tabs defaultValue="devices" className="px-6 pb-5">
        <TabsList className="mb-3 h-7 rounded-lg">
          <TabsTrigger
            value="devices"
            className="h-6 rounded-md px-2 text-[11px]"
          >
            Devices
          </TabsTrigger>
          <TabsTrigger
            value="browsers"
            className="h-6 rounded-md px-2 text-[11px]"
          >
            Browsers
          </TabsTrigger>
          <TabsTrigger value="os" className="h-6 rounded-md px-2 text-[11px]">
            OS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="devices">
          {devices.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {/* Donut chart */}
              <ChartContainer
                config={pieConfig}
                className="mx-auto aspect-square h-[160px]"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={70}
                    strokeWidth={2}
                    stroke="var(--card)"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>

              {/* Device list */}
              <div className="space-y-2">
                {devices.map((d, i) => (
                  <DeviceRow
                    key={d.name}
                    label={d.name.charAt(0).toUpperCase() + d.name.slice(1)}
                    icon={
                      DEVICE_ICONS[d.name] || (
                        <MonitorIcon className="text-muted-foreground size-3.5" />
                      )
                    }
                    views={d.views}
                    percentage={Math.round((d.views / totalDeviceViews) * 100)}
                    color={DEVICE_COLORS[i % DEVICE_COLORS.length]}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="browsers">
          {browsers.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2">
              {browsers.map((b, i) => (
                <DeviceRow
                  key={b.name}
                  label={b.name}
                  icon={
                    <ChromeIcon className="text-muted-foreground size-3.5" />
                  }
                  views={b.views}
                  percentage={Math.round(
                    (b.views /
                      (browsers.reduce((a, x) => a + x.views, 0) || 1)) *
                      100
                  )}
                  color={DEVICE_COLORS[i % DEVICE_COLORS.length]}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="os">
          {operatingSystems.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-2">
              {operatingSystems.map((os, i) => (
                <DeviceRow
                  key={os.name}
                  label={os.name}
                  icon={
                    <MonitorIcon className="text-muted-foreground size-3.5" />
                  }
                  views={os.views}
                  percentage={Math.round(
                    (os.views /
                      (operatingSystems.reduce((a, x) => a + x.views, 0) ||
                        1)) *
                      100
                  )}
                  color={DEVICE_COLORS[i % DEVICE_COLORS.length]}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

function DeviceRow({
  label,
  icon,
  views,
  percentage,
  color,
}: {
  label: string;
  icon: React.ReactNode;
  views: number;
  percentage: number;
  color: string;
}) {
  return (
    <div className="group relative">
      <div className="relative z-10 flex items-center justify-between py-1.5">
        <div className="flex items-center gap-2.5">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-xs tabular-nums">
            {percentage}%
          </span>
          <span className="w-12 text-right text-xs font-semibold tabular-nums">
            {views}
          </span>
        </div>
      </div>
      <div
        className="absolute inset-0 rounded-lg opacity-[0.08]"
        style={{
          background: color,
          width: `${percentage}%`,
        }}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-32 items-center justify-center rounded-xl border border-dashed">
      <p className="text-muted-foreground text-sm">No device data yet</p>
    </div>
  );
}
