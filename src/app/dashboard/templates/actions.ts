
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

    if (error) {
        // Fallback for schema cache issues.
        if (error.message.includes('relationship')) {
             console.warn('Relationship not found, falling back to separate queries.');
             const { data: templatesData, error: templatesError } = await supabase
                .from('templates')
                .select('*')
                .eq('user_id', user.id);
             if(templatesError) throw templatesError;

             const userIds = templatesData.map(t => t.user_id);
             const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .in('id', userIds);
             if(profilesError) throw profilesError;

             const profilesMap = new Map(profilesData.map(p => [p.id, p]));

             const combinedData = templatesData.map(t => ({
                ...t,
                profiles: profilesMap.get(t.user_id) || null
             }));
             
             return { success: true, data: combinedData as TemplateWithAuthor[] };
        }
      throw error;
    }
    
    return { success: true, data: data as TemplateWithAuthor[] };
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    return { success: false, error: error.message };
  }
}

export async function getTemplateById(templateId: string): Promise<{ success: boolean; data?: TemplateWithAuthor; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Usuario no autenticado.' };
  }

  try {
    const { data: templateData, error: templateError } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .eq('user_id', user.id)
      .single();

    if (templateError) throw templateError;
    if (!templateData) return { success: false, error: 'Plantilla no encontrada.' };

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', templateData.user_id)
      .single();
    
    // Non-fatal error, we can proceed without profile info
    if (profileError) {
      console.warn(`Could not fetch profile for template ${templateId}:`, profileError.message);
    }
    
    const combinedData = {
        ...templateData,
        profiles: profileData || null
    };

    return { success: true, data: combinedData as TemplateWithAuthor };
  } catch (error: any) {
    console.error(`Error fetching template ${templateId}:`, error);
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

export async function deleteTemplate(templateId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Usuario no autenticado.' };

    try {
        const { error } = await supabase
            .from('templates')
            .delete()
            .eq('id', templateId)
            .eq('user_id', user.id);
        
        if (error) throw error;

        revalidatePath('/dashboard/templates');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getAllCategories(): Promise<{ success: boolean, data?: string[], error?: string }> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Usuario no autenticado.' };

    try {
        const { data, error } = await supabase
            .from('templates')
            .select('categories')
            .eq('user_id', user.id);
        
        if (error) throw error;

        const allCategories = new Set<string>();
        data.forEach(item => {
            if(item.categories) {
                item.categories.forEach(cat => allCategories.add(cat));
            }
        });

        return { success: true, data: Array.from(allCategories).sort() };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteCategory(categoryName: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Usuario no autenticado.' };

    try {
        // 1. Find all templates that have this category
        const { data: templatesToUpdate, error: fetchError } = await supabase
            .from('templates')
            .select('id, categories')
            .eq('user_id', user.id)
            .contains('categories', [categoryName]);

        if (fetchError) throw fetchError;

        // 2. Prepare the updates by removing the category from each template
        for (const template of templatesToUpdate) {
            const updatedCategories = template.categories.filter((c: string) => c !== categoryName);
            const { error: updateError } = await supabase
                .from('templates')
                .update({ categories: updatedCategories, updated_at: new Date().toISOString() })
                .eq('id', template.id)
                .eq('user_id', user.id); // Re-check ownership for security

            if (updateError) {
                // If one update fails, stop and report the error
                throw new Error(`Error updating template ${template.id}: ${updateError.message}`);
            }
        }
        
        revalidatePath('/dashboard/templates');
        return { success: true };
    } catch (error: any) {
        console.error(`Error deleting category "${categoryName}":`, error);
        return { success: false, error: `No se pudo eliminar la categoría: ${error.message}` };
    }
}

    