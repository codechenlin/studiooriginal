
'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const BUCKET_NAME = 'template_backgrounds';

export async function listFiles() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Usuario no autenticado.' };
  }

  const { data, error } = await supabase.storage.from(BUCKET_NAME).list(user.id, {
    limit: 100,
    offset: 0,
    sortBy: { column: 'created_at', order: 'desc' },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function uploadFile(file: File) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'Debes iniciar sesión para subir un archivo.' };
    }

    const filePath = `${user.id}/${Date.now()}_${file.name}`;

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
  filePath: z.string(),
  newName: z.string().min(1),
});

export async function renameFile(filePath: string, newName: string) {
    const validated = renameFileSchema.safeParse({ filePath, newName });
    if (!validated.success) return { success: false, error: 'Datos inválidos.' };

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado.' };

    const oldPath = filePath;
    const pathParts = oldPath.split('/');
    pathParts[pathParts.length - 1] = newName;
    const newPath = pathParts.join('/');

    const { error } = await supabase.storage.from(BUCKET_NAME).move(oldPath, newPath);

    if (error) return { success: false, error: error.message };
    return { success: true };
}


const deleteFileSchema = z.object({
  filePath: z.string(),
});

export async function deleteFile(filePath: string) {
    const validated = deleteFileSchema.safeParse({ filePath });
    if (!validated.success) return { success: false, error: 'Datos inválidos.' };

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No autenticado.' };
    
    // Ensure user is deleting a file in their own folder
    if (!filePath.startsWith(user.id)) {
      return { success: false, error: "Permiso denegado." };
    }

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    
    if (error) return { success: false, error: error.message };
    return { success: true };
}
