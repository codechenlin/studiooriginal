
'use server';

import { createClient } from '@/lib/supabase/actions';
import { revalidatePath } from 'next/cache';
import { type Domain } from './types';

export async function createOrGetDomain(domainName: string): Promise<{ success: boolean; data?: Domain; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
      console.error('User not authenticated in createOrGetDomain');
      return { success: false, error: 'Usuario no autenticado.' };
  };

  // Check if domain already exists for this user
  let { data: existingDomain, error: fetchError } = await supabase
    .from('domains')
    .select('*')
    .eq('user_id', user.id)
    .eq('domain_name', domainName)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
    console.error('Error fetching domain:', fetchError);
    return { success: false, error: 'Error al buscar el dominio: ' + fetchError.message };
  }
  
  if (existingDomain) {
    return { success: true, data: existingDomain };
  }

  // Create new domain if it doesn't exist
  const { data: newDomain, error: insertError } = await supabase
    .from('domains')
    .insert({ domain_name: domainName, user_id: user.id })
    .select()
    .single();

  if (insertError) {
    console.error('Error creating domain:', insertError);
    return { success: false, error: 'Error al crear el dominio: ' + insertError.message };
  }
  
  revalidatePath('/dashboard/servers');
  return { success: true, data: newDomain };
}

export async function updateDomainVerificationCode(domainId: string, verificationCode: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('domains')
    .update({ verification_code: verificationCode, updated_at: new Date().toISOString() })
    .eq('id', domainId);

  if (error) console.error('Error updating verification code:', error);
}

export async function setDomainAsVerified(domainId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('domains')
    .update({ is_verified: true, updated_at: new Date().toISOString() })
    .eq('id', domainId);

  if (error) console.error('Error setting domain as verified:', error);
}

// --- DNS CHECK ACTIONS ---
export async function saveDnsChecks(domainId: string, checks: any) { // Type simplified for brevity
  const supabase = createClient();
  
  const { error } = await supabase
    .from('dns_checks')
    .upsert({
      domain_id: domainId,
      ...checks,
      updated_at: new Date().toISOString()
    }, { onConflict: 'domain_id' });
    
  if (error) console.error('Error saving DNS checks:', error);
}

export async function updateDkimKey(domainId: string, dkimPublicKey: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('dns_checks')
    .upsert({
      domain_id: domainId,
      dkim_public_key: dkimPublicKey,
      updated_at: new Date().toISOString()
    }, { onConflict: 'domain_id' });

  if (error) console.error('Error updating DKIM key:', error);
}

// --- SMTP CREDENTIALS ACTIONS ---
export async function saveSmtpCredentials(domainId: string, credentials: any) { // Type simplified for brevity
    const supabase = createClient();
    const { error } = await supabase
        .from('smtp_credentials')
        .upsert({
            domain_id: domainId,
            ...credentials,
            updated_at: new Date().toISOString()
        }, { onConflict: 'domain_id' });
    
    if (error) console.error('Error saving SMTP credentials:', error);
}

    