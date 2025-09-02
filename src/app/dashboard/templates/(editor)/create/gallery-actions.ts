
'use server';
export const revalidate = 0;

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { cookies } from 'next/headers';

export type StorageFile = {
    name: string;
    id: string;
    updated_at: string;
    created_at: string;
    last_accessed_at: string;
    metadata: {
        eTag: string;
        size: number;
        mimetype: string;
        cacheControl: string;
        lastModified: string;
        contentLength: number;
        httpStatusCode: number;
    };
};

const BUCKET_NAME = 'template_backgrounds';

export async function listFiles() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
        return { success: false, error: 'Usuario no autenticado.', data: null };
    }

    try {
        const { data, error } = await supabase.storage.from(BUCKET_NAME).list(user.id, {
            limit: 100,
            offset: 0,
            sortBy: { column: 'created_at', order: 'desc' },
        });

        if (error) throw error;
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

        // Prepend user.id to the name of each file to create the full path
        const filesWithFullPath = data.map(file => ({
            ...file,
            name: `${user.id}/${file.name}`
        }));

        return { success: true, data: { files: filesWithFullPath as StorageFile[], baseUrl: supabaseUrl }, error: null };
    } catch (error: any) {
        return { success: false, error: error.message, data: null };
    }
}


const uploadFileSchema = z.object({
  file: z.any(),
});
export async function uploadFile(input: { file: File }) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
        return { success: false, error: 'Usuario no autenticado.', data: null };
    }
    
    const { file } = input;
    // The path should be user_id/filename.png
    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    
    try {
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file);

        if (error) throw error;
        
        // After successful upload, get the full file object to return
        const { data: listData, error: listError } = await supabase.storage.from(BUCKET_NAME).list(user.id, {
          search: data.path.split('/').pop()
        });

        if (listError || !listData || listData.length === 0) {
            throw new Error(listError?.message || 'Could not retrieve uploaded file details.');
        }

        const newFile = { ...listData[0], name: `${user.id}/${listData[0].name}`};
        
        return { success: true, data: { uploadedFile: newFile }, error: null };
    } catch (error: any) {
        return { success: false, error: error.message, data: null };
    }
}


const renameFileSchema = z.object({
  oldPath: z.string(),
  newName: z.string(),
});
export async function renameFile(input: z.infer<typeof renameFileSchema>) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Usuario no autenticado.' };
    
    const validatedInput = renameFileSchema.safeParse(input);
    if (!validatedInput.success) return { success: false, error: 'Datos de entrada inválidos.' };

    const { oldPath, newName } = validatedInput.data;
    
    // Construct the new path within the user's folder
    const newPath = `${user.id}/${newName}`;

    try {
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .move(oldPath, newPath);
        if (error) throw error;
        return { success: true, data: { ...data, newPath } };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


const deleteFilesSchema = z.object({
  paths: z.array(z.string()),
});
export async function deleteFiles(input: z.infer<typeof deleteFilesSchema>) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
     const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Usuario no autenticado.' };

    const validatedInput = deleteFilesSchema.safeParse(input);
    if (!validatedInput.success) return { success: false, error: 'Datos de entrada inválidos.' };
    
    const { paths } = validatedInput.data;

    try {
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove(paths);
        if (error) throw error;
        return { success: true, data };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
