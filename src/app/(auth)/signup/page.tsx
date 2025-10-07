
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
import { User, Mail, Eye, EyeOff } from "lucide-react";
import React from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/context/language-context";
import { Logo } from "@/components/common/logo";
import { SphereAnimation } from "@/components/login/sphere-animation";
import { motion } from 'framer-motion';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.name,
        },
      },
    });

    if (error) {
      toast({
        title: t('signup_error_title'),
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t('signup_success_title'),
        description: t('signup_success_desc'),
        className: 'bg-gradient-to-r from-[#E18700] to-[#FFAB00] border-none text-white',
      });
      router.push("/login?new_user=true");
    }
  }

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center p-10 overflow-hidden bg-background">
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
              <User className="size-8" style={{ color: '#00ADEC' }} />
              </motion.div>
              <CardTitle className="text-3xl font-bold">{t('signup_create_account')}</CardTitle>
              <CardDescription>
                  {t('signup_description')}
              </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
              <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>{t('full_name')}</FormLabel>
                          <FormControl>
                              <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                              <Input
                                  placeholder={t('your_name_placeholder')}
                                  {...field}
                                  className="pl-10 bg-background/70 border-border/50"
                              />
                              </div>
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                      />
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
                                  className="pl-10 bg-background/70 border-border/50"
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
                          <FormLabel>{t('password')}</FormLabel>
                          <FormControl>
                              <div className="relative">
                              <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
                                  {isPasswordVisible ? <EyeOff className="size-4 text-muted-foreground" /> : <Eye className="size-4 text-muted-foreground" />}
                              </button>
                              <Input
                                  type={isPasswordVisible ? "text" : "password"}
                                  placeholder="••••••••"
                                  {...field}
                                  className="pr-10 bg-background/70 border-border/50"
                              />
                              </div>
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                      />
                      <Button type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90 transition-opacity" disabled={form.formState.isSubmitting}>
                          {form.formState.isSubmitting ? t('signup_creating_account') : t('signup_create_account_button')}
                      </Button>
                  </form>
              </Form>
          </CardContent>
          <CardFooter className="px-6 pb-6">
              <div className="text-center text-sm text-muted-foreground w-full">
                  <p>
                  {t('signup_already_account')}{" "}
                      <Link
                          href="/login"
                          className="font-medium text-primary hover:underline"
                      >
                          {t('sign_in_link')}
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
  );
}
