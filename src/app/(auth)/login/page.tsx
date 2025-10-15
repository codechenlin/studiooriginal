
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
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Eye, EyeOff, Fingerprint } from "lucide-react";
import React, { useState, useTransition, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { LoadingModal } from "@/components/common/loading-modal";
import { useLanguage } from "@/context/language-context";
import { SphereAnimation } from "@/components/login/sphere-animation";
import { Logo } from "@/components/common/logo";
import { motion } from 'framer-motion';
import { MediaPreview } from "@/components/admin/media-preview";
import { useAuthPages } from "../auth-pages-provider";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { loginImages } = useAuthPages();
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const handleThemeChange = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    };
    handleThemeChange();
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

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
  
  const imageUrl = theme === 'dark' ? loginImages.dark : loginImages.light;

  return (
    <>
      <LoadingModal isOpen={isLoading} variant="login" />
      <div className="w-screen h-screen flex bg-background">
        <div className="w-1/2 h-full relative flex flex-col justify-center items-center p-10 overflow-hidden">
            <div className="absolute top-8 left-8 z-20">
                <Logo />
            </div>
            <SphereAnimation />

            <div className="w-full max-w-sm z-10">
                <Card className="bg-card/60 dark:bg-zinc-900/60 backdrop-blur-lg border-border/20 shadow-2xl overflow-hidden">
                <CardHeader className="text-center px-6 pt-6">
                    <motion.div
                    className="inline-block p-3 mx-auto border-2 border-cyan-400/20 rounded-full bg-cyan-500/10 mb-4"
                    animate={{
                        scale: [1, 1.05, 1],
                        boxShadow: [
                        '0 0 15px #00ADEC00',
                        '0 0 25px #00ADEC',
                        '0 0 15px #00ADEC00',
                        ]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                    <Fingerprint className="size-8" style={{ color: '#00ADEC' }} />
                    </motion.div>
                    <CardTitle className="text-3xl font-bold">{t('login_welcome_back')}</CardTitle>
                    <CardDescription>
                    {t('login_enter_credentials')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>{t('email')}</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="you@example.com"
                                    {...field}
                                    className="bg-background/70 border-border/50"
                                />
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
                                    className="text-xs text-primary hover:underline"
                                >
                                    {t('forgot_password_link')}
                                </Link>
                            </div>
                            <FormControl>
                                <div className="relative">
                                <Input
                                    type={isPasswordVisible ? "text" : "password"}
                                    placeholder="••••••••"
                                    {...field}
                                    className="pr-10 bg-background/70 border-border/50"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent"
                                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                >
                                    {isPasswordVisible ? (
                                    <EyeOff className="size-4" />
                                    ) : (
                                    <Eye className="size-4" />
                                    )}
                                    <span className="sr-only">
                                    {isPasswordVisible ? "Hide password" : "Show password"}
                                    </span>
                                </Button>
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90 transition-opacity" disabled={isPending}>
                        {isPending ? t('login_signing_in') : t('login_sign_in_button')}
                        </Button>
                    </form>
                    </Form>
                </CardContent>
                <CardFooter className="px-6 pb-6">
                    <div className="text-center text-sm text-muted-foreground w-full">
                    <p>
                        {t('login_no_account')}{" "}
                        <Link
                        href="/signup"
                        className="font-medium text-primary hover:underline"
                        >
                        {t('sign_up_link')}
                        </Link>
                    </p>
                    </div>
                </CardFooter>
                <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                    <motion.div
                    className="h-full bg-gradient-to-r from-primary to-accent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </div>
                </Card>
            </div>
        </div>
        <div className="w-1/2 h-full relative overflow-hidden">
             <MediaPreview src={imageUrl} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      </div>
    </>
  );
}
