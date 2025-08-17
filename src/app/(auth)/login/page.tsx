
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
import { Eye, EyeOff, Mail } from "lucide-react";
import React from "react";
import { createClient } from "@/lib/supabase/client";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const supabase = createClient();
    // Check if this is a redirect from signup to show the welcome modal
    const isNewUser = new URLSearchParams(window.location.search).get('new_user') === 'true';

    const { error } = await supabase.auth.signInWithPassword(values);

    if (error) {
       if (error.message === "Email not confirmed") {
        toast({
          title: "Aun no puedes iniciar sesion",
          description: "Confirma tu correo electrónico para activar tu cuenta.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Inicio de sesión incorrecto",
          description: "Correo electrónico o contraseña nos son validas, intenta nuevamente",
          variant: "destructive",
        });
      }
    } else {
      if (!isNewUser) {
        toast({
            title: "¡Qué bueno verte de nuevo!",
            description: "Tu espacio de trabajo te estaba esperando.",
            className: 'bg-success-login border-none text-white',
        });
      }
      const redirectPath = isNewUser ? "/dashboard?welcome=true" : "/dashboard";
      router.push(redirectPath);
      router.refresh();
    }
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>
          Enter your credentials to access your account.
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        placeholder="you@example.com"
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
                      className="text-sm font-medium text-primary hover:underline"
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
            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent/80 hover:opacity-90 transition-opacity" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Iniciando sesión..." : "Sign In"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-sm">
        <p className="text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
