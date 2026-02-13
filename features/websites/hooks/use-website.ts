"use client";

import { useQuery } from "@tanstack/react-query";

import { eden } from "@/config/eden";

export const useWebsite = (id: string | undefined) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["website", id],
    queryFn: async () => {
      const res = await eden.websites({ id: id! }).get();
      if (res.error) throw new Error("Failed to fetch website");
      return res.data;
    },
    enabled: !!id,
  });

  return { data, isLoading, isError, refetch };
};

export const useWebsiteScript = (id: string | undefined) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["website-script", id],
    queryFn: async () => {
      const res = await eden.websites({ id: id! }).script.get();
      if (res.error) throw new Error("Failed to fetch script");
      return res.data;
    },
    enabled: !!id,
  });

  return { data, isLoading, isError, refetch };
};
