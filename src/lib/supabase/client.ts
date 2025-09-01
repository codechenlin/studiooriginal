
"use client";

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase URL or Anon Key is missing. Returning a mock client.");
    // This mock needs to be more robust for local development without keys.
    // Let's ensure getUser doesn't always return null if there's a session.
    let mockSession = null;
    try {
        if (typeof window !== 'undefined') {
            const sessionStr = localStorage.getItem('supabase.auth.token');
            if (sessionStr) {
                // A very basic mock. In a real scenario, you'd parse the JWT.
                const parsed = JSON.parse(sessionStr);
                if (parsed.user) mockSession = { user: parsed.user };
            }
        }
    } catch (e) {
        // ignore
    }

    return {
      auth: {
        signInWithPassword: async () => ({ error: { message: "Supabase not configured." } }),
        signUp: async () => ({ error: { message: "Supabase not configured." } }),
        resetPasswordForEmail: async () => ({ error: { message: "Supabase not configured." } }),
        getUser: async () => ({ data: { user: mockSession?.user || null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      storage: {
        from: () => ({
            upload: async () => ({ error: { message: "Supabase not configured." } }),
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
        })
      },
       from: () => ({
        select: async () => ({ data: [], error: { message: "Supabase not configured." } }),
      }),
    } as any;
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
}
