
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
import { KeyRound } from "lucide-react";
import React, { useTransition, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/context/language-context";
import { SphereAnimation } from "@/components/login/sphere-animation";
import { Logo } from "@/components/common/logo";
import { motion } from 'framer-motion';
import { MediaPreview } from "@/components/admin/media-preview";
import { useAuthPages } from "../auth-pages-provider";


const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { forgotPasswordImages } = useAuthPages();
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
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
        const supabase = createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
        });

        if (error) {
            toast({
                title: t('signup_error_title'),
                description: error.message,
                variant: "destructive",
            });
        } else {
            toast({
                title: t('forgot_password_success_title'),
                description: t('forgot_password_success_desc'),
            });
            router.push("/login");
        }
    });
  }

  const imageUrl = theme === 'dark' ? forgotPasswordImages.dark : forgotPasswordImages.light;

  return (
    <>
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
                    <KeyRound className="size-8" style={{ color: '#00ADEC' }} />
                    </motion.div>
                    <CardTitle className="text-3xl font-bold">{t('forgot_password_title')}</CardTitle>
                    <CardDescription>
                    {t('forgot_password_description')}
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
                        <Button type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90 transition-opacity" disabled={isPending}>
                        {isPending ? t('forgot_password_sending') : t('forgot_password_send_button')}
                        </Button>
                    </form>
                    </Form>
                </CardContent>
                <CardFooter className="px-6 pb-6">
                    <div className="text-center text-sm text-muted-foreground w-full">
                    <Link
                        href="/login"
                        className="font-medium text-primary hover:underline"
                        >
                        {t('back_to_sign_in')}
                        </Link>
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
