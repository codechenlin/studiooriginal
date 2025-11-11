
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
     console.warn("Supabase URL or Anon Key is missing. Returning a mock client for server-side operations.");
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: new Error("Supabase credentials not provided.") }),
        getSession: async () => ({ data: { session: null }, error: new Error("Supabase credentials not provided.") }),
      },
       from: (table: string) => ({
        select: async () => ({ data: [], error: new Error(`Supabase not configured for table ${table}.`) }),
        insert: async () => ({ data: [], error: new Error(`Supabase not configured for table ${table}.`) }),
        update: async () => ({ data: [], error: new Error(`Supabase not configured for table ${table}.`) }),
        delete: async () => ({ data: [], error: new Error(`Supabase not configured for table ${table}.`) }),
        upsert: async () => ({ data: [], error: new Error(`Supabase not configured for table ${table}.`) }),
      }),
       storage: {
        from: (bucket: string) => ({
          list: async () => ({ data: [], error: new Error(`Supabase not configured for bucket ${bucket}.`) }),
          upload: async () => ({ data: null, error: new Error(`Supabase not configured for bucket ${bucket}.`) }),
          move: async () => ({ data: null, error: new Error(`Supabase not configured for bucket ${bucket}.`) }),
          remove: async () => ({ data: [], error: new Error(`Supabase not configured for bucket ${bucket}.`) }),
          getPublicUrl: (path: string) => ({ data: { publicUrl: '' } }),
        }),
      },
    } as any;
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
