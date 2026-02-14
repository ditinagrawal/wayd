"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { formatDistanceToNow } from "date-fns";
import {
  CalendarIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ClipboardCopyIcon,
  CodeIcon,
  ExternalLinkIcon,
  GlobeIcon,
  HashIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalyticsChart } from "@/features/analytics/components/analytics-chart";
import { DevicesView } from "@/features/analytics/components/devices-view";
import { LiveVisitors } from "@/features/analytics/components/live-visitors";
import { LocationsView } from "@/features/analytics/components/locations-view";
import { SourcesView } from "@/features/analytics/components/sources-view";
import { TopPages } from "@/features/analytics/components/top-pages";
import { useLiveVisitors } from "@/features/analytics/hooks/use-analytics";
import {
  useWebsite,
  useWebsiteScript,
} from "@/features/websites/hooks/use-website";
import { useWebsites } from "@/features/websites/hooks/use-websites";

interface WebsiteDetailViewProps {
  id: string;
}

export const WebsiteDetailView = ({ id }: WebsiteDetailViewProps) => {
  const router = useRouter();
  const [period, setPeriod] = useState("7d");
  const { data: website, isLoading, isError } = useWebsite(id);
  const { data: websites } = useWebsites();
  const { data: liveData } = useLiveVisitors(id);

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (
    isError ||
    !website ||
    typeof website !== "object" ||
    !("id" in website)
  ) {
    return (
      <div className="mx-auto w-full max-w-6xl p-2">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20">
          <p className="text-muted-foreground text-sm">
            Website not found or something went wrong.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => router.push("/websites")}
          >
            Back to Websites
          </Button>
        </div>
      </div>
    );
  }

  const site = website as {
    id: string;
    domain: string;
    siteId: string;
    createdAt: string | Date;
  };

  const otherWebsites = websites?.filter((w) => w.id !== site.id) ?? [];
  const liveCount = liveData?.count ?? 0;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-2">
      {/* Top Section */}
      <div className="ring-foreground/10 bg-card overflow-hidden rounded-2xl ring-1">
        {/* Header row: Website switcher + Period selector + Visit link */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-xl">
              <GlobeIcon className="text-primary size-5" />
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hover:bg-muted flex items-center gap-2 rounded-lg px-2 py-1 text-left transition-colors">
                    <div>
                      <h1 className="text-lg font-semibold tracking-tight">
                        {site.domain}
                      </h1>
                    </div>
                    <ChevronDownIcon className="text-muted-foreground size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuLabel>Switch website</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center gap-2.5 font-medium"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <GlobeIcon className="text-primary size-4" />
                    <span className="truncate">{site.domain}</span>
                    <CheckCircle2Icon className="text-primary ml-auto size-3.5" />
                  </DropdownMenuItem>
                  {otherWebsites.map((w) => (
                    <DropdownMenuItem
                      key={w.id}
                      className="flex items-center gap-2.5"
                      onSelect={() => router.push(`/websites/${w.id}`)}
                    >
                      <GlobeIcon className="text-muted-foreground size-4" />
                      <span className="truncate">{w.domain}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger size="sm" className="h-8 w-auto gap-1.5 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <a
              href={`https://${site.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
            >
              Visit site
              <ExternalLinkIcon className="size-3.5" />
            </a>
          </div>
        </div>

        <Separator />

        {/* Stats row */}
        <div className="bg-border/50 grid grid-cols-2 gap-px sm:grid-cols-4">
          {/* Active Users */}
          <div className="bg-card flex flex-col gap-1 px-6 py-4">
            <span className="text-muted-foreground text-xs font-medium">
              Status
            </span>
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-sm font-semibold">Active</span>
            </div>
          </div>

          {/* Active visitors */}
          <div className="bg-card flex flex-col gap-1 px-6 py-4">
            <span className="text-muted-foreground text-xs font-medium">
              Current visitors
            </span>
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-sm font-semibold">{liveCount} online</span>
            </div>
          </div>

          {/* Site ID */}
          <div className="bg-card flex flex-col gap-1 px-6 py-4">
            <span className="text-muted-foreground text-xs font-medium">
              Site ID
            </span>
            <div className="flex items-center gap-2">
              <HashIcon className="text-muted-foreground size-3.5" />
              <Badge variant="outline" className="font-mono text-[11px]">
                {site.siteId}
              </Badge>
            </div>
          </div>

          {/* Created */}
          <div className="bg-card flex flex-col gap-1 px-6 py-4">
            <span className="text-muted-foreground text-xs font-medium">
              Added
            </span>
            <div className="flex items-center gap-2">
              <CalendarIcon className="text-muted-foreground size-3.5" />
              <span className="text-sm font-medium">
                {formatDistanceToNow(new Date(site.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Script section */}
        <ScriptSection id={site.id} />
      </div>

      {/* Analytics Chart */}
      <AnalyticsChart websiteId={site.id} period={period} />

      {/* Two-column layout: Pages + Live Visitors */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopPages websiteId={site.id} period={period} />
        <LiveVisitors websiteId={site.id} />
      </div>

      {/* Two-column layout: Locations + Sources */}
      <div className="grid gap-6 lg:grid-cols-2">
        <LocationsView websiteId={site.id} period={period} />
        <SourcesView websiteId={site.id} period={period} />
      </div>

      {/* Devices */}
      <div className="grid gap-6 lg:grid-cols-1">
        <DevicesView websiteId={site.id} period={period} />
      </div>
    </div>
  );
};

const ScriptSection = ({ id }: { id: string }) => {
  const { data: scriptData, isLoading } = useWebsiteScript(id);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const script =
    scriptData && typeof scriptData === "object" && "script" in scriptData
      ? (scriptData.script as string)
      : null;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!script) return;
    await navigator.clipboard.writeText(script);
    setCopied(true);
    toast.success("Script copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="hover:bg-muted/50 flex w-full items-center justify-between px-6 py-3 text-left transition-colors"
      >
        <div className="flex items-center gap-2">
          <CodeIcon className="text-muted-foreground size-4" />
          <span className="text-sm font-medium">Tracking Script</span>
          <Badge variant="outline" className="text-[10px]">
            Install
          </Badge>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDownIcon className="text-muted-foreground size-4" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4">
              <div className="bg-muted overflow-hidden rounded-lg border">
                {isLoading ? (
                  <div className="p-3">
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : script ? (
                  <pre className="overflow-x-auto p-3 text-xs leading-relaxed break-all whitespace-pre-wrap">
                    <code className="text-foreground/70">{script}</code>
                  </pre>
                ) : (
                  <div className="text-muted-foreground p-3 text-xs">
                    Script unavailable
                  </div>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-muted-foreground text-xs">
                  Add this script to the {"<head>"} of your website to start
                  tracking.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={isLoading || !script}
                  className="h-7 shrink-0 gap-1.5 text-xs"
                >
                  {copied ? (
                    <>
                      <CheckCircle2Icon className="size-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <ClipboardCopyIcon className="size-3" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DetailSkeleton = () => {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-2">
      <div className="ring-foreground/10 bg-card overflow-hidden rounded-2xl ring-1">
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-xl" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
        <Separator />
        <div className="bg-border/50 grid grid-cols-2 gap-px sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card flex flex-col gap-2 px-6 py-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
        <Separator />
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-16 rounded-md" />
          </div>
          <Skeleton className="mt-3 h-10 w-full rounded-lg" />
          <Skeleton className="mt-2 h-3 w-60" />
        </div>
      </div>

      {/* Chart skeleton */}
      <div className="ring-foreground/10 bg-card overflow-hidden rounded-2xl ring-1">
        <div className="bg-border/50 grid grid-cols-2 gap-px sm:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card flex flex-col gap-2 px-6 py-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
        <div className="p-6">
          <Skeleton className="h-[280px] w-full rounded-xl" />
        </div>
      </div>

      {/* Bottom skeletons */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="ring-foreground/10 bg-card overflow-hidden rounded-2xl ring-1"
          >
            <div className="p-6">
              <Skeleton className="mb-4 h-5 w-32" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-8 w-full" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
