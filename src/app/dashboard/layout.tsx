
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

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    toast({
      title: `Cambiado a modo ${!isDarkMode ? "oscuro" : "claro"}`,
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
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                {item.submenu ? (
                   <Collapsible>
                    <CollapsibleTrigger asChild>
                       <SidebarMenuButton
                        isActive={isSubmenuActive(item.href)}
                        tooltip={{ children: item.label }}
                        className="w-full justify-between"
                      >
                         <div className="flex items-center gap-2">
                           <item.icon />
                           <span>{item.label}</span>
                         </div>
                         <ChevronRight className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                       </SidebarMenuButton>
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
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={{ children: item.label }}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="flex flex-col gap-2">
           <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/dashboard/settings" passHref>
                    <SidebarMenuButton
                      isActive={pathname.startsWith('/dashboard/settings')}
                      tooltip={{ children: 'Ajustes' }}
                    >
                      <Settings />
                      <span>Ajustes</span>
                    </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
          </SidebarMenu>
          
          <div className="flex items-center justify-center gap-2 border-t border-sidebar-border pt-2 group-data-[collapsible=icon]:flex-col">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Bell className="size-5"/>
              <span className="sr-only">Notificaciones</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-foreground">
              {isDarkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
              <span className="sr-only">Cambiar tema</span>
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn("flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 border-t border-sidebar-border mt-auto", 
              "group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:border-t-0"
              )}>
                <Avatar className="size-8">
                  <AvatarImage src="https://placehold.co/100x100.png" alt="User" data-ai-hint="profile avatar" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
                  <span className="font-semibold">Usuario</span>
                  <span className="text-xs text-muted-foreground">user@mailflow.ai</span>
                </div>
                <ChevronRight className="size-4 ml-auto group-data-[collapsible=icon]:hidden"/>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings"><Settings className="mr-2 size-4" /><span>Ajustes</span></Link>
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
