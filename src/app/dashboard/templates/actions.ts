
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type TemplateWithAuthor = {
  id: string;
  name: string;
  updated_at: string;
  content: any;
  user_id: string;
  categories: string[];
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export async function getTemplates(): Promise<{ success: boolean; data?: TemplateWithAuthor[]; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Usuario no autenticado.' };
  }

  try {
    const { data, error } = await supabase
      .from('templates')
      .select(`
        id,
        name,
        updated_at,
        content,
        user_id,
        categories,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    
    return { success: true, data: data as TemplateWithAuthor[] };
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    return { success: false, error: error.message };
  }
}

export async function renameTemplate(templateId: string, newName: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Usuario no autenticado.' };

    try {
        const { error } = await supabase
            .from('templates')
            .update({ name: newName, updated_at: new Date().toISOString() })
            .eq('id', templateId)
            .eq('user_id', user.id);
        
        if (error) throw error;

        revalidatePath('/dashboard/templates');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateTemplateCategories(templateId: string, categories: string[]) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Usuario no autenticado.' };

    try {
        const { error } = await supabase
            .from('templates')
            .update({ categories, updated_at: new Date().toISOString() })
            .eq('id', templateId)
            .eq('user_id', user.id);
        
        if (error) throw error;

        revalidatePath('/dashboard/templates');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

