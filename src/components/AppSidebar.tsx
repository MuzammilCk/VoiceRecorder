import {
  Mic,
  Search,
  FolderOpen,
  Brain,
  TrendingUp,
  Users,
  FileText,
  Music // Added the Music icon
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";



const mainItems = [
  { title: "Voice Studio", url: "/", icon: Mic },
  { title: "Song Search", url: "/song-search", icon: Music }, // Added Song Search link
  { title: "AI Insights", url: "/insights", icon: Brain },
  { title: "Search & Discovery", url: "/search", icon: Search },
  { title: "Analytics", url: "/analytics", icon: TrendingUp },
];

const workspaceItems = [
  { title: "My Recordings", url: "/recordings", icon: FolderOpen },
  { title: "Shared with Me", url: "/shared", icon: Users },
  { title: "Transcripts", url: "/transcripts", icon: FileText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isCollapsed = state === "collapsed";
  const isActive = (path: string) => currentPath === path;
  const getNavCls = (path: string) =>
    isActive(path)
      ? "bg-primary/20 text-primary border-r-2 border-primary font-medium glow-primary"
      : "hover:bg-secondary/80 transition-all duration-200";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-card border-r border-border/50">
        {/* Logo */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <Mic className="w-4 h-4 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-lg bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Voice recorder
                </h2>
                <p className="text-xs text-muted-foreground">Voice Intelligence</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            {!isCollapsed ? "Main" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-11">
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="w-5 h-5" />
                      {!isCollapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Workspace */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            {!isCollapsed ? "Workspace" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-11">
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="w-5 h-5" />
                      {!isCollapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
    </Sidebar>
  );
}