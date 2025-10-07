
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/common/logo";
import {
  Users,
  Settings,
  LogOut,
  LayoutDashboard,
  Image as ImageIcon,
  HardDrive,
  File as FileIcon
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
import { cn } from "@/lib/utils";
import { Preloader } from "@/components/common/preloader";
import { FileManagerModal } from '@/components/dashboard/file-manager-modal';


const menuItems = [
  { href: "/d92y02b11u/dashboard", label: "Escritorio", icon: LayoutDashboard },
  { href: "/d92y02b11u/dashboard/logos", label: "Logos y Portadas", icon: ImageIcon },
];

function AdminPanelContent({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) {
  const pathname = usePathname();
  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);

  return (
    <>
    <FileManagerModal open={isFileManagerOpen} onOpenChange={setIsFileManagerOpen} />
    <div className="flex min-h-screen bg-muted/30">
      <aside className="w-64 flex-shrink-0 border-r border-border bg-card p-4 flex flex-col">
        <div className="mb-8">
            <Logo />
        </div>
        <nav className="flex-grow space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-foreground/80 transition-all hover:bg-muted",
                    isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
            <button
                onClick={() => setIsFileManagerOpen(true)}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-foreground/80 transition-all hover:bg-muted w-full"
                )}
              >
                <FileIcon className="h-5 w-5" />
                <span className="font-medium">Gestor de Archivos</span>
            </button>
        </nav>
        <div className="mt-auto">
             <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button variant="outline" className="w-full justify-start gap-3">
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <HardDrive className="size-5 text-primary"/>
                    </div>
                    <div className="text-left">
                        <p className="font-semibold">Super Admin</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem><Settings className="mr-2"/>Ajustes</DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/login"><LogOut className="mr-2 text-destructive"/><span>Cerrar Sesión</span></Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
    </>
  );
}


export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.replace('/d92y02b11u');
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();
            
            if (profile?.role !== 'super-admin') {
                await supabase.auth.signOut();
                router.replace('/d92y02b11u');
                return;
            }

            setUser(session.user);
            setIsLoading(false);
        };

        // Only run security check on panel pages, not the login page.
        if (pathname.startsWith('/d92y02b11u/dashboard')) {
            checkUser();
        } else {
            setIsLoading(false);
        }
    }, [router, pathname]);

    // If it's the login page, render children directly without the panel layout.
    if (pathname === '/d92y02b11u') {
        return <>{children}</>;
    }

    if (isLoading) {
        return <Preloader />;
    }
    
    if (!user) {
        // This should theoretically not be reached due to the redirect, but it's a good fallback.
        return null; 
    }

    return <AdminPanelContent user={user}>{children}</AdminPanelContent>;
}
