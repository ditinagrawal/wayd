"use client";

import { useState } from "react";

import { CheckCircle2Icon, ClipboardCopyIcon, GlobeIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useWebsiteScript } from "@/features/websites/hooks/use-website";
import { useCreateWebsite } from "@/features/websites/hooks/use-websites";

interface AddWebsiteDialogProps {
  children: React.ReactNode;
}

export const AddWebsiteDialog = ({ children }: AddWebsiteDialogProps) => {
  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState("");
  const [createdId, setCreatedId] = useState<string | null>(null);

  const createWebsite = useCreateWebsite();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleaned = domain
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/+$/, "");

    if (!cleaned) {
      toast.error("Please enter a valid domain");
      return;
    }

    createWebsite.mutate(cleaned, {
      onSuccess: (data) => {
        toast.success("Website added successfully");
        if (data && typeof data === "object" && "id" in data) {
          setCreatedId(data.id as string);
        }
      },
      onError: () => {
        toast.error("Failed to add website. It may already exist.");
      },
    });
  };

  const handleClose = () => {
    setOpen(false);
    setDomain("");
    setCreatedId(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => (v ? setOpen(true) : handleClose())}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className={createdId ? "sm:max-w-xl" : ""}>
        {createdId ? (
          <SuccessState id={createdId} onClose={handleClose} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Add a new website</DialogTitle>
              <DialogDescription>
                Enter the domain of the website you want to track. We'll
                generate a unique tracking script for you.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="domain">Domain</Label>
                <div className="relative">
                  <GlobeIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    id="domain"
                    placeholder="example.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="pl-9"
                    autoFocus
                    disabled={createWebsite.isPending}
                  />
                </div>
                <p className="text-muted-foreground text-xs">
                  Enter without http:// or https://
                </p>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={createWebsite.isPending || !domain.trim()}
                >
                  {createWebsite.isPending ? (
                    <>
                      <Spinner className="size-4" />
                      Adding...
                    </>
                  ) : (
                    "Add Website"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

const SuccessState = ({ id, onClose }: { id: string; onClose: () => void }) => {
  const { data: scriptData, isLoading } = useWebsiteScript(id);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (
      !scriptData ||
      typeof scriptData !== "object" ||
      !("script" in scriptData)
    )
      return;
    await navigator.clipboard.writeText(scriptData.script as string);
    setCopied(true);
    toast.success("Script copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-full">
            <CheckCircle2Icon className="text-primary size-5" />
          </div>
          <div className="grid gap-1">
            <DialogTitle>Website added</DialogTitle>
            <DialogDescription>
              Your website has been added. Install the tracking script to start
              collecting analytics.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Spinner className="text-primary size-5" />
        </div>
      ) : scriptData &&
        typeof scriptData === "object" &&
        "script" in scriptData ? (
        <div className="grid gap-2">
          <Label className="text-xs font-medium">Installation Script</Label>
          <div className="bg-muted overflow-hidden rounded-lg border">
            <pre className="overflow-x-auto p-3 text-xs leading-relaxed break-all whitespace-pre-wrap">
              <code className="text-foreground/70">
                {scriptData.script as string}
              </code>
            </pre>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <CheckCircle2Icon className="size-4" />
                Copied!
              </>
            ) : (
              <>
                <ClipboardCopyIcon className="size-4" />
                Copy Script
              </>
            )}
          </Button>
        </div>
      ) : null}
    </>
  );
};
