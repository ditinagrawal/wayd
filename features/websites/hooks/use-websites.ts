"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { eden } from "@/config/eden";

export const useWebsites = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["websites"],
    queryFn: async () => {
      const res = await eden.websites.get();
      if (res.error) throw new Error("Failed to fetch websites");
      return res.data;
    },
  });

  return { data, isLoading, isError, refetch };
};

export const useCreateWebsite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (domain: string) => {
      const res = await eden.websites.post({ domain });
      if (res.error) throw new Error("Failed to create website");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["websites"] });
    },
  });
};
