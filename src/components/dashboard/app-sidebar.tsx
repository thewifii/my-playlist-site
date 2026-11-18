"use client";

import { Disc3, ExternalLink, FileText, Headphones, Inbox, LayoutDashboard, ListMusic, LogOut, Mic2, Music2, Shirt, Users, Video } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { collectionKeys, collections } from "@/lib/collections";
import type { CollectionKey } from "@/lib/types";

const ICONS: Record<CollectionKey, React.ComponentType<{ className?: string }>> = {
  posts: FileText,
  episodes: Mic2,
  portfolio: Video,
  tracks: Music2,
  playlists: ListMusic,
  products: Shirt,
};

export function AppSidebar({ user }: { user: { name: string; email: string; role: "admin" | "contributor" } }) {
  const pathname = usePathname();

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/login");
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" tooltip="The Wifii CMS">
              <Link href="/dashboard">
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-gold font-heading text-sm font-bold text-ink">W</span>
                <span className="grid leading-tight">
                  <span className="font-heading font-bold">THE WIFII</span>
                  <span className="text-xs text-muted-foreground">Content dashboard</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"} tooltip="Overview">
                  <Link href="/dashboard">
                    <LayoutDashboard /> <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {collectionKeys.map((key) => {
                const Icon = ICONS[key];
                const href = `/dashboard/${key}`;
                return (
                  <SidebarMenuItem key={key}>
                    <SidebarMenuButton asChild isActive={pathname === href} tooltip={collections[key].label}>
                      <Link href={href}>
                        <Icon /> <span>{collections[key].label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard/inbox"} tooltip="Inbox">
                  <Link href="/dashboard/inbox">
                    <Inbox /> <span>Inbox</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {user.role === "admin" ? (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/dashboard/contributors"} tooltip="Contributors">
                      <Link href="/dashboard/contributors">
                        <Users /> <span>Contributors</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="DJ Setlist Builder">
                      <Link href="/dj-builder">
                        <Disc3 /> <span>DJ Setlist Builder</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              ) : null}
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="View site">
                  <Link href="/home" target="_blank">
                    <ExternalLink /> <span>View site</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:hidden">
              <Headphones className="size-4 shrink-0 text-highlight" />
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-bold">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} tooltip="Sign out">
              <LogOut /> <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
