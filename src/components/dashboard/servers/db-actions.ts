
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { type Domain } from './types';

interface FormState {
  success: boolean;
  message: string;
  status: 'idle' | 'DOMAIN_CREATED' | 'DOMAIN_FOUND' | 'DOMAIN_TAKEN' | 'INVALID_INPUT' | 'ERROR';
  domain: Domain | null;
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
    const { data: existingDomain, error: fetchError } = await supabase
      .from('domains')
      .select(`
        *,
        dns_checks ( * )
      `)
      .eq('domain_name', domainName)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }
    
    if (existingDomain) {
      if (existingDomain.user_id === user.id) {
         return { 
           success: false, 
           message: 'Este nombre de dominio ya se encuentra verificado en tu cuenta.', 
           status: 'DOMAIN_FOUND',
           domain: existingDomain 
         };
      } else {
        return { 
          success: false, 
          message: 'Este dominio no es posible añadirlo por que ya esta ocupado y en uso.',
          status: 'DOMAIN_TAKEN',
          domain: null,
        };
      }
    }

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

    if (insertError) throw insertError;
    
    const { error: dnsCheckError } = await supabase
        .from('dns_checks')
        .insert({ domain_id: newDomain.id });

    if (dnsCheckError) {
        console.error("Failed to create initial dns_check entry:", dnsCheckError);
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
    if (error.code === '23505') {
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

export async function getVerifiedDomains(): Promise<{ success: boolean; data?: Domain[]; error?: string; }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Usuario no autenticado.' };
  }
  
  try {
    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_verified', true);
      
    if (error) throw error;
    
    return { success: true, data: data as Domain[] || [] };
  } catch (error: any) {
    console.error('Error fetching verified domains:', error);
    return { success: false, error: error.message };
  }
}

export async function getVerifiedDomainsCount(): Promise<{ success: boolean; count?: number; error?: string; }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Usuario no autenticado.' };
  }
  
  try {
    const { count, error } = await supabase
      .from('domains')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_verified', true);
      
    if (error) throw error;
    
    return { success: true, count: count || 0 };
  } catch (error: any) {
    console.error('Error fetching verified domains count:', error);
    return { success: false, error: error.message };
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

export async function updateDomainVerificationCode(domainId: string, code: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('domains')
    .update({ verification_code: code, updated_at: new Date().toISOString() })
    .eq('id', domainId);

  if (error) {
    console.error('Error updating verification code:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function updateDkimKey(domainId: string, publicKey: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('dns_checks')
        .update({ dkim_public_key: publicKey, updated_at: new Date().toISOString() })
        .eq('domain_id', domainId)
        .select();

    if (error) {
        console.error('Error updating DKIM key:', error);
        throw error;
    }
    
    return { success: true, data };
}

export async function saveDnsChecks(domainId: string, checks: Partial<{ spf_verified: boolean; dkim_verified: boolean; dmarc_verified: boolean; mx_verified: boolean; bimi_verified: boolean; vmc_verified: boolean; is_fully_verified: boolean }>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('dns_checks')
        .update({ ...checks, updated_at: new Date().toISOString() })
        .eq('domain_id', domainId)
        .select()
        .single();
    
    if (error) {
        console.error('Error saving DNS checks:', error);
        throw error;
    }
    
    // The trigger will now handle updating the count automatically
    // when 'is_fully_verified' changes.

    revalidatePath('/dashboard/servers');
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
