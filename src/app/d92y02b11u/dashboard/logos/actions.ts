
'use server';

import fs from 'fs/promises';
import path from 'path';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/client';
import { revalidatePath } from 'next/cache';

const configPath = path.join(process.cwd(), 'src', 'app', 'lib', 'app-config.json');

async function readConfig() {
  try {
    const fileContent = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
     console.error("Failed to read app-config.json, returning default. Error:", error);
     return {
        loginBackgroundImageUrl: '',
        signupBackgroundImageUrl: '',
        forgotPasswordBackgroundImageUrl: '',
        logoLightUrl: null,
        logoDarkUrl: null,
     }
  }
}

async function writeConfig(config: any) {
  try {
    const fileContent = JSON.stringify(config, null, 2);
    await fs.writeFile(configPath, fileContent, 'utf-8');
  } catch (error) {
    console.error("Failed to write to app-config.json:", error);
    throw new Error('No se pudo guardar el archivo de configuración.');
  }
}

export async function getAppConfig() {
    try {
        const config = await readConfig();
        return { success: true, data: config };
    } catch (error: any) {
        return { success: false, error: 'No se pudo leer la configuración.' };
    }
}

export async function uploadLogoAndGetUrl(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  // Use the client-side client for file uploads from client components
  const supabase = createClient();
  
  // We still need the server client to get the user securely
  const supabaseServer = createServerClient();
  const { data: { user } } = await supabaseServer.auth.getUser();


  if (!user) {
    return { success: false, error: 'Usuario no autenticado.' };
  }

  const file = formData.get('file') as File;
  if (!file) {
    return { success: false, error: 'No se proporcionó ningún archivo.' };
  }

  const filePath = `${user.id}/${Date.now()}_${file.name}`;

  try {
    const { data, error } = await supabase.storage
      .from('admin_assets')
      .upload(filePath, file);

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
        .from('admin_assets')
        .getPublicUrl(data.path);

    return { success: true, url: publicUrl };
  } catch (error: any) {
    console.error("Error al subir archivo a Supabase:", error);
    return { success: false, error: error.message };
  }
}

export async function updateAppConfig(key: string, value: string | null): Promise<{ success: boolean; error?: string }> {
    try {
        const config = await readConfig();
        config[key] = value;
        await writeConfig(config);
        
        revalidatePath('/(auth)/login', 'page');
        revalidatePath('/(auth)/signup', 'page');
        revalidatePath('/(auth)/forgot-password', 'page');
        revalidatePath('/d92y02b11u/dashboard/logos', 'page');
        revalidatePath('/dashboard', 'layout'); // To re-render logo in sidebar
        revalidatePath('/d92y02b11u/dashboard', 'layout'); // To re-render logo in admin sidebar

        return { success: true };
    } catch (error: any) {
        console.error("Error al actualizar app-config.json:", error);
        return { success: false, error: 'No se pudo guardar la configuración de la portada.' };
    }
}
