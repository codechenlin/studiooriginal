
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, Eye, EyeOff, Shield, Loader2 } from "lucide-react";
import React, { useState, useTransition } from "react";
import { Logo } from "@/components/common/logo";
import { createClient } from "@/lib/supabase/client";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const supabase = createClient();
      
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword(values);

      if (loginError) {
        toast({
          title: "Error de Autenticación",
          description: "Las credenciales proporcionadas no son correctas.",
          variant: "destructive",
        });
        return;
      }

      if (loginData.user) {
        // Check for super-admin role in the 'profiles' table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', loginData.user.id)
          .single();

        if (profileError || !profile) {
            await supabase.auth.signOut();
            toast({
                title: "Acceso Denegado",
                description: "No se pudo verificar el rol del usuario.",
                variant: "destructive",
            });
            return;
        }
        
        if (profile.role === 'super-admin') {
          toast({
            title: "Acceso Concedido",
            description: "Bienvenido, Super Administrador. Redirigiendo al panel...",
            className: 'bg-success-login border-none text-white'
          });
          router.push("/d92y02b11u");
        } else {
          // If not super-admin, sign them out and show an error
          await supabase.auth.signOut();
          toast({
            title: "Acceso Denegado",
            description: "No tienes los permisos necesarios para acceder a esta área.",
            variant: "destructive",
          });
        }
      }
    });
  }

  return (
     <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: "url(/bg-pattern.svg)",
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background z-0" />
      <div className="z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="text-primary"/>
              <CardTitle className="text-2xl">Admin Access</CardTitle>
            </div>
            <CardDescription>
              Please enter your administrator credentials to proceed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <Input
                            placeholder="admin@mailflow.ai"
                            {...field}
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                         <Link
                            href="/forgot-password"
                            className="text-xs text-primary hover:underline"
                        >
                            Forgot Password?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="absolute right-3 top-1/2 -translate-y-1/2">
                            {isPasswordVisible ? <EyeOff className="size-4 text-muted-foreground" /> : <Eye className="size-4 text-muted-foreground" />}
                          </button>
                          <Input
                            type={isPasswordVisible ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                            className="pr-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent/80 hover:opacity-90 transition-opacity" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    "Sign In as Admin"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
           <CardFooter className="text-sm justify-center">
            <p className="text-muted-foreground">This login is for authorized personnel only.</p>
           </CardFooter>
        </Card>
      </div>
    </div>
  );
}
