
'use server';

import { createClient } from '@/lib/supabase/client'; // Keep this for potential client-side use
import { z } from 'zod';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const BUCKET_NAME = 'template_backgrounds';

// This function should be used for all server-side Supabase actions
async function getSupabaseServerClient() {
    const cookieStore = cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
            },
        }
    );
}

export async function listFiles(userId: string) {
  const supabase = await getSupabaseServerClient();
  
  const { data, error } = await supabase.storage.from(BUCKET_NAME).list(userId, {
    limit: 100,
    offset: 0,
    sortBy: { column: 'created_at', order: 'desc' },
  });

  if (error) {
    console.error("Error listing files:", error);
    return { success: false, error: error.message };
  }
  
  // Return the base URL so client can construct the full path
  return { success: true, data: { files: data, supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL! } };
}

export async function uploadFile(file: File, userId: string) {
    const supabase = await getSupabaseServerClient();

    // The user session is automatically handled by the server client from cookies
    const filePath = `${userId}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

    if (uploadError) {
        return { success: false, error: uploadError.message };
    }

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return { success: true, publicUrl: data.publicUrl };
}

const renameFileSchema = z.object({
  oldPath: z.string(),
  newName: z.string().min(1),
});

export async function renameFile(oldPath: string, newName: string) {
    const validated = renameFileSchema.safeParse({ oldPath, newName });
    if (!validated.success) return { success: false, error: 'Datos inválidos.' };

    const supabase = await getSupabaseServerClient();
    
    const parts = oldPath.split('/');
    const oldFileName = parts.pop();
    const userIdFolder = parts.join('/');
    const newPath = `${userIdFolder}/${newName}`;

    const { error } = await supabase.storage.from(BUCKET_NAME).move(oldPath, newPath);

    if (error) {
        console.error("Supabase rename error:", error)
        return { success: false, error: error.message };
    }
    return { success: true };
}


const deleteFileSchema = z.object({
  filePath: z.string(),
});

export async function deleteFile(filePath: string) {
    const validated = deleteFileSchema.safeParse({ filePath });
    if (!validated.success) return { success: false, error: 'Datos inválidos.' };

    const supabase = await getSupabaseServerClient();
    
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    
    if (error) { 
        console.error("Supabase delete error:", error)
        return { success: false, error: error.message };
    }
    return { success: true };
}
