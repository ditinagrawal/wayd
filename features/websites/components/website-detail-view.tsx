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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
  const { data: website, isLoading, isError } = useWebsite(id);
  const { data: websites } = useWebsites();

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

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-2">
      {/* Top Section */}
      <div className="ring-foreground/10 bg-card overflow-hidden rounded-2xl ring-1">
        {/* Header row: Website switcher + Visit link */}
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
              <span className="text-sm font-semibold">0 online</span>
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

      {/* Bottom Section (placeholder for charts and insights) */}
    </div>
  );
};

const ScriptSection = ({ id }: { id: string }) => {
  const { data: scriptData, isLoading } = useWebsiteScript(id);
  const [copied, setCopied] = useState(false);

  const script =
    scriptData && typeof scriptData === "object" && "script" in scriptData
      ? (scriptData.script as string)
      : null;

  const handleCopy = async () => {
    if (!script) return;
    await navigator.clipboard.writeText(script);
    setCopied(true);
    toast.success("Script copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CodeIcon className="text-muted-foreground size-4" />
          <span className="text-sm font-medium">Tracking Script</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          disabled={isLoading || !script}
          className="h-7 gap-1.5 text-xs"
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
      <div className="bg-muted mt-3 overflow-hidden rounded-lg border">
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
      <p className="text-muted-foreground mt-2 text-xs">
        Add this script to the {"<head>"} of your website to start tracking.
      </p>
    </div>
  );
};

const DetailSkeleton = () => {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-2">
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
    </div>
  );
};
