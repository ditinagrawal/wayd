"use client";

import { GlobeIcon, PlusIcon } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AddWebsiteDialog } from "@/features/websites/components/add-website-dialog";
import { WebsiteCard } from "@/features/websites/components/website-card";
import { useWebsites } from "@/features/websites/hooks/use-websites";

export const WebsitesView = () => {
  const { data: websites, isLoading, isError } = useWebsites();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Websites</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage and monitor your tracked websites.
          </p>
        </div>
        <AddWebsiteDialog>
          <Button>
            <PlusIcon className="size-4" />
            Add Website
          </Button>
        </AddWebsiteDialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[140px] rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16">
          <p className="text-muted-foreground text-sm">
            Something went wrong loading your websites.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        </div>
      ) : websites && websites.length > 0 ? (
        <motion.div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.06 },
            },
          }}
        >
          {websites.map((website) => (
            <motion.div
              key={website.id}
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <WebsiteCard
                website={{
                  ...website,
                  createdAt:
                    typeof website.createdAt === "string"
                      ? website.createdAt
                      : new Date(website.createdAt).toISOString(),
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
};

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20">
      <div className="bg-muted mb-4 flex size-12 items-center justify-center rounded-full">
        <GlobeIcon className="text-muted-foreground size-6" />
      </div>
      <h3 className="text-base font-medium">No websites yet</h3>
      <p className="text-muted-foreground mt-1 max-w-sm text-center text-sm">
        Add your first website to start tracking analytics and collecting
        insights.
      </p>
      <AddWebsiteDialog>
        <Button className="mt-6">
          <PlusIcon className="size-4" />
          Add Your First Website
        </Button>
      </AddWebsiteDialog>
    </div>
  );
};
