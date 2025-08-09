"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/common/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Mails,
  Users,
  Feather,
  Settings,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: Mails },
  { href: "/dashboard/lists", label: "Lists", icon: Users },
  { href: "/dashboard/templates", label: "Templates", icon: Feather },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    toast({
      title: `Switched to ${!isDarkMode ? "Dark" : "Light"} Mode`,
    });
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between">
            <Logo />
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn("flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50", 
              "group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
              )}>
                <Avatar className="size-8">
                  <AvatarImage src="https://placehold.co/100x100.png" alt="User" data-ai-hint="profile avatar" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
                  <span className="font-semibold">User</span>
                  <span className="text-xs text-muted-foreground">user@mailflow.ai</span>
                </div>
                <ChevronRight className="size-4 ml-auto group-data-[collapsible=icon]:hidden"/>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings"><Settings className="mr-2 size-4" /><span>Settings</span></Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleTheme}>
                 {isDarkMode ? <Sun className="mr-2 size-4" /> : <Moon className="mr-2 size-4" />}
                <span>{isDarkMode ? "Light" : "Dark"} Mode</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/login"><LogOut className="mr-2 size-4" /><span>Log Out</span></Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
