
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/common/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mails,
  Users,
  Zap,
  Server,
  Plug,
  Settings,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
  Bell,
  LayoutDashboard,
  LayoutTemplate,
  Code,
  PlusCircle,
  History,
  User,
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
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";


const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { 
    href: "/dashboard/campaigns", 
    label: "Campaña", 
    icon: Mails,
    submenu: [
      { href: "/dashboard/campaigns/create", label: "Crear Campaña", icon: PlusCircle },
      { href: "/dashboard/campaigns", label: "Ver Campañas", icon: History },
    ]
  },
  { href: "/dashboard/lists", label: "Lista", icon: Users },
  { href: "/dashboard/templates", label: "Plantillas", icon: LayoutTemplate },
  { href: "/dashboard/automation", label: "Automatización", icon: Zap },
  { href: "/dashboard/servers", label: "Servidores", icon: Server },
  { href: "/dashboard/integration", label: "Integración", icon: Plug },
  { href: "/dashboard/campaign-api", label: "API Campaña", icon: Code },
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

  React.useEffect(() => {
    // This effect runs only when isDarkMode changes, after the initial render.
    // We can safely show the toast here.
    // The initial state is set without a toast.
  }, [isDarkMode]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    toast({
      title: `Cambiado a modo ${newMode ? "oscuro" : "claro"}`,
    });
  };
  
  const isSubmenuActive = (basePath: string) => {
    return pathname.startsWith(basePath);
  }

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
            {menuItems.map((item) => {
                const isActive = item.submenu ? isSubmenuActive(item.href) : pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    {item.submenu ? (
                      <Collapsible defaultOpen={isActive}>
                        <CollapsibleTrigger asChild>
                           <div className={cn(
                              "group/menu-item-wrapper relative rounded-lg p-1",
                              isActive ? "bg-zinc-800/80 dark:bg-zinc-800/80" : "bg-transparent",
                              "hover:bg-gradient-to-r hover:from-led-start hover:to-led-end"
                            )}>
                              <div className="bg-sidebar rounded-md p-0.5">
                                <SidebarMenuButton
                                  isActive={false} // We manage active state on the wrapper
                                  className="w-full justify-between bg-transparent hover:bg-transparent"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-zinc-700/60 rounded-full">
                                      <item.icon className="shrink-0 text-white size-4"/>
                                    </div>
                                    <span className="text-black dark:text-white text-sm">{item.label}</span>
                                  </div>
                                  <ChevronRight className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-90 text-white" />
                                </SidebarMenuButton>
                              </div>
                           </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.submenu.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.href}>
                                <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                                  <Link href={subItem.href}>
                                    <subItem.icon />
                                    <span>{subItem.label}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                       <Link href={item.href} passHref>
                        <div className={cn(
                          "group/menu-item-wrapper relative rounded-lg p-1",
                          isActive ? "bg-zinc-800/80 dark:bg-zinc-800/80" : "bg-transparent",
                          "hover:bg-gradient-to-r hover:from-led-start hover:to-led-end"
                        )}>
                           <div className={cn("bg-sidebar rounded-md p-0.5", isActive && "bg-transparent")}>
                            <SidebarMenuButton
                              isActive={false}
                              className="w-full justify-start gap-2 bg-transparent hover:bg-transparent"
                            >
                               <div className={cn("p-1.5 rounded-full", isActive ? "bg-zinc-700/90" : "bg-zinc-800/50 dark:bg-zinc-800/50")}>
                                <item.icon className="shrink-0 text-white dark:text-white size-4"/>
                              </div>
                              <span className={cn("text-sm", isActive ? "text-black dark:text-white" : "text-black dark:text-white")}>{item.label}</span>
                            </SidebarMenuButton>
                          </div>
                        </div>
                      </Link>
                    )}
                  </SidebarMenuItem>
                )
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="flex flex-col gap-2">
           <SidebarMenu>
             <SidebarMenuItem>
                <div className={cn(
                    "group/settings-button relative flex items-center w-full h-12 px-2 rounded-lg cursor-pointer",
                    "bg-gradient-to-r from-settings-normal-start to-settings-normal-end",
                    "hover:from-settings-hover-start hover:to-settings-hover-end"
                )}>
                    <Link href="/dashboard/settings" className="flex items-center w-full h-full gap-2">
                        <div className="flex items-center justify-center size-8 rounded-full bg-black/10">
                            <Settings className="text-white" />
                        </div>
                        <span className="font-semibold text-white ml-0">Ajustes</span>
                    </Link>
                </div>
            </SidebarMenuItem>
          </SidebarMenu>
          
          <div className="flex items-center justify-center gap-4 p-2 group-data-[collapsible=icon]:flex-col">
            <Button 
                variant="ghost" 
                size="icon" 
                className="group/button rounded-full size-10 bg-background/50 dark:bg-zinc-800/80 backdrop-blur-sm border border-black/5 dark:border-white/10 text-black dark:text-white hover:bg-gradient-to-r from-[#AD00EC] to-[#0018EC] dark:hover:bg-gradient-to-r dark:from-[#AD00EC] dark:to-[#0018EC]"
            >
              <Bell className="size-5 text-black dark:text-white group-hover/button:text-white dark:group-hover/button:text-white"/>
              <span className="sr-only">Notificaciones</span>
            </Button>
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme} 
                className="group/button rounded-full size-10 bg-background/50 dark:bg-zinc-800/80 backdrop-blur-sm border border-black/5 dark:border-white/10 text-black dark:text-white hover:bg-gradient-to-r from-[#AD00EC] to-[#0018EC] dark:hover:bg-gradient-to-r dark:from-[#AD00EC] dark:to-[#0018EC]"
            >
              {isDarkMode ? <Sun className="size-5 text-white" /> : <Moon className="size-5 text-black group-hover/button:text-white" />}
              <span className="sr-only">Cambiar tema</span>
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <div className="group/profile-button relative rounded-md p-0.5 bg-gradient-to-r from-[#1700E6] to-[#009AFF] hover:from-[#00CE07] hover:to-[#A6EE00]">
                  <button className={cn(
                    "flex w-full items-center gap-2 overflow-hidden rounded-md p-1.5 text-left text-sm outline-none ring-sidebar-ring transition-colors focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
                    "bg-background/80 dark:bg-zinc-800/80 backdrop-blur-sm",
                    "group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0"
                  )}>
                    <Avatar className="size-8">
                      <AvatarImage src="https://placehold.co/100x100.png" alt="User" data-ai-hint="profile avatar" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
                      <span className="font-semibold text-foreground">Usuario</span>
                      <span className="text-xs text-muted-foreground">user@mailflow.ai</span>
                    </div>
                    <ChevronRight className="size-4 ml-auto text-muted-foreground group-data-[collapsible=icon]:hidden"/>
                  </button>
               </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings"><User className="mr-2 size-4" /><span>Mi Perfil</span></Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/login"><LogOut className="mr-2 size-4" /><span>Cerrar Sesión</span></Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}

    