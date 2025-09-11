
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
import React, { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { LoadingModal } from "@/components/common/loading-modal";
import { useLanguage } from "@/context/language-context";
import { SphereAnimation } from "@/components/login/sphere-animation";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    startTransition(async () => {
        const supabase = createClient();
        const isNewUser = new URLSearchParams(window.location.search).get('new_user') === 'true';

        const { error } = await supabase.auth.signInWithPassword(values);

        if (error) {
            if (error.message === "Email not confirmed") {
                toast({
                    title: t('login_not_confirmed_title'),
                    description: t('login_not_confirmed_desc'),
                    variant: "destructive",
                });
            } else {
                toast({
                    title: t('login_error_title'),
                    description: t('login_error_desc'),
                    variant: "destructive",
                });
            }
            setIsLoading(false);
        } else {
            if (!isNewUser) {
                toast({
                    title: t('login_success_title'),
                    description: t('login_success_desc'),
                    className: 'bg-success-login border-none text-white',
                });
            }
            const redirectPath = isNewUser ? "/dashboard?welcome=true" : "/dashboard";
            router.push(redirectPath);
        }
    });
  }

  return (
    <>
      <div className="absolute inset-0 z-[-1]">
        <SphereAnimation />
      </div>
      <LoadingModal isOpen={isLoading} variant="login" />
      <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl w-full">
        <CardHeader>
          <CardTitle className="text-2xl">{t('login_welcome_back')}</CardTitle>
          <CardDescription>
            {t('login_enter_credentials')}
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
                    <FormLabel>{t('email')}</FormLabel>
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
                      <FormLabel>{t('password')}</FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {t('forgot_password_link')}
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
                {isPending ? t('login_signing_in') : t('login_sign_in_button')}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="text-sm">
          <p className="text-muted-foreground">
            {t('login_no_account')}{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              {t('sign_up_link')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </>
  );
}
