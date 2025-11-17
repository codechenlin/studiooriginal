
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

const generateVerificationCode = () => `daybuu-verificacion=${Math.random().toString(36).substring(2, 12)}`;

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
         return { 
           success: false, // Not success in terms of creation
           message: 'Este nombre de dominio ya se encuentra verificado en tu cuenta.', 
           status: 'DOMAIN_FOUND',
           domain: existingDomain 
         };
      } else {
        // If it belongs to another user, return a "taken" status.
        return { 
          success: false, 
          message: 'Este dominio no es posible añadirlo por que ya esta ocupado y en uso.',
          status: 'DOMAIN_TAKEN',
          domain: null,
        };
      }
    }

    // If it doesn't exist, create it with a verification code.
    const verificationCode = generateVerificationCode();
    const { data: newDomain, error: insertError } = await supabase
      .from('domains')
      .insert({ 
          domain_name: domainName, 
          user_id: user.id,
          verification_code: verificationCode
      })
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
          message: 'Este dominio no es posible añadirlo por que ya esta ocupado y en uso.',
          status: 'DOMAIN_TAKEN',
          domain: null,
        };
    }
    return { success: false, message: 'Error de servidor: ' + error.message, status: 'ERROR', domain: null };
  }
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
  revalidatePath('/dashboard/servers');
  return { success: true };
}


export async function updateDkimKey(domainId: string, publicKey: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('dns_checks')
        .update({ dkim_public_key: publicKey, updated_at: new Date().toISOString() })
        .eq('domain_id', domainId)
        .select();

    if (error && error.code === 'PGRST116') { // No rows found, so insert
        const { data: insertData, error: insertError } = await supabase
            .from('dns_checks')
            .insert({ domain_id: domainId, dkim_public_key: publicKey });
        if(insertError) throw insertError;
        return { success: true, data: insertData };
    }
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
       const { data: insertData, error: insertError } = await supabase
            .from('dns_checks')
            .insert({ domain_id: domainId, dkim_public_key: publicKey });
       if(insertError) throw insertError;
       return { success: true, data: insertData };
    }
    
    return { success: true, data };
}

export async function saveDnsChecks(domainId: string, checks: Partial<{ spf_verified: boolean; dkim_verified: boolean; dmarc_verified: boolean; mx_verified: boolean; bimi_verified: boolean; vmc_verified: boolean }>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('dns_checks')
        .update({ ...checks, updated_at: new Date().toISOString() })
        .eq('domain_id', domainId)
        .select();

    if (error && error.code === 'PGRST116') { // No rows found, so insert
        const { data: insertData, error: insertError } = await supabase
            .from('dns_checks')
            .insert({ domain_id: domainId, ...checks });
        if(insertError) throw insertError;
        return { success: true, data: insertData };
    }
        
    if (error) throw error;

    if (!data || data.length === 0) {
       const { data: insertData, error: insertError } = await supabase
            .from('dns_checks')
            .insert({ domain_id: domainId, ...checks });
       if(insertError) throw insertError;
       return { success: true, data: insertData };
    }

    return { success: true, data };
}

export async function saveSmtpCredentials(domainId: string, credentials: { host: string, port: number, encryption: string, username: string, password?: string, is_validated: boolean }) {
    const supabase = createClient();
    // In a real app, password should be encrypted or stored in a secure vault.
    // For this example, we'll store it directly, but this is NOT recommended for production.
    const { data, error } = await supabase
        .from('smtp_credentials')
        .upsert({ domain_id: domainId, ...credentials }, { onConflict: 'domain_id' })
        .select();
    
    if (error) {
        console.error('Error saving SMTP credentials:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data };
}
