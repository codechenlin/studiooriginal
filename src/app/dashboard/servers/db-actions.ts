
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { type Domain } from './types';

interface FormState {
  success: boolean;
  message: string;
  status: 'idle' | 'DOMAIN_CREATED' | 'DOMAIN_FOUND' | 'DOMAIN_TAKEN' | 'INVALID_INPUT' | 'ERROR';
  domain?: Domain | null;
}

export async function createOrGetDomainAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { 
      success: false, 
      message: 'Usuario no autenticado. Por favor, inicie sesión de nuevo.',
      status: 'ERROR',
      domain: null,
    };
  };
  
  const domainName = formData.get('domain') as string;

  if (!domainName || !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domainName)) {
      return { 
        success: false, 
        message: "Por favor, introduce un nombre de dominio válido.",
        status: 'INVALID_INPUT',
        domain: null,
      };
  }

  try {
    // Check if the domain exists at all.
    const { data: existingDomain, error: fetchError } = await supabase
      .from('domains')
      .select('*')
      .eq('domain_name', domainName)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine.
      throw fetchError;
    }
    
    // If the domain exists...
    if (existingDomain) {
      // And it belongs to the current user, return a "found" status.
      if (existingDomain.user_id === user.id) {
         revalidatePath('/dashboard/servers');
         return { 
           success: false, // Not success in terms of creation
           message: 'Este dominio ya está en tu cuenta. Puedes continuar con la configuración.', 
           status: 'DOMAIN_FOUND',
           domain: existingDomain 
         };
      } else {
        // If it belongs to another user, return a "taken" status.
        return { 
          success: false, 
          message: 'Este dominio no está disponible porque ya se encuentra en uso.',
          status: 'DOMAIN_TAKEN',
          domain: null,
        };
      }
    }

    // If it doesn't exist, create it.
    const { data: newDomain, error: insertError } = await supabase
      .from('domains')
      .insert({ domain_name: domainName, user_id: user.id })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }
    
    revalidatePath('/dashboard/servers');
    return { 
      success: true, 
      message: 'Dominio creado con éxito.',
      status: 'DOMAIN_CREATED',
      domain: newDomain 
    };

  } catch (error: any) {
    console.error('Error in createOrGetDomainAction:', error);
    // This could happen if another user registers it in a race condition due to the UNIQUE constraint.
    if (error.code === '23505') { // unique_violation
        return { 
          success: false, 
          message: 'Este dominio no está disponible porque ya se encuentra en uso.',
          status: 'DOMAIN_TAKEN',
          domain: null,
        };
    }
    return { success: false, message: 'Error de servidor: ' + error.message, status: 'ERROR', domain: null };
  }
}


export async function updateDomainVerificationCode(domainId: string, verificationCode: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('domains')
    .update({ verification_code: verificationCode, updated_at: new Date().toISOString() })
    .eq('id', domainId);

  if (error) {
    console.error('Error updating verification code:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function setDomainAsVerified(domainId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('domains')
    .update({ is_verified: true, updated_at: new Date().toISOString() })
    .eq('id', domainId);

  if (error) {
    console.error('Error setting domain as verified:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

    