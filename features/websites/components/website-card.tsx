"use client";

import { formatDistanceToNow } from "date-fns";
import { ExternalLinkIcon, GlobeIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface WebsiteCardProps {
  website: {
    id: string;
    domain: string;
    siteId: string;
    createdAt: string;
  };
}

export const WebsiteCard = ({ website }: WebsiteCardProps) => {
  return (
    <Card
      size="sm"
      className="group/website transition-shadow duration-200 hover:shadow-md"
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-lg">
            <GlobeIcon className="text-primary size-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate">{website.domain}</CardTitle>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Added{" "}
              {formatDistanceToNow(new Date(website.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>
        <CardAction>
          <Badge variant="outline" className="font-mono text-[10px]">
            {website.siteId}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground text-xs">Active</span>
          </div>
          <a
            href={`https://${website.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs transition-colors"
          >
            Visit
            <ExternalLinkIcon className="size-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
};
