"use client";

import Link from "next/link";

import { LogOut, Settings } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useSignout } from "@/hooks/use-signout";
import { useUser } from "@/hooks/use-user";

export const UserProfile = () => {
  const { user, isPending } = useUser();
  const { signOut, isPending: isSigningOut } = useSignout();
  if (isPending)
    return <Skeleton className="h-8 w-8 animate-pulse rounded-full" />;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 rounded-full">
          <AvatarImage src={user?.image ?? ""} alt={user?.name} />
          <AvatarFallback className="rounded-full">
            {user?.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="m-2">
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <Settings size={16} className="opacity-80" aria-hidden="true" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={signOut} disabled={isSigningOut}>
          <LogOut size={16} className="opacity-80" aria-hidden="true" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
