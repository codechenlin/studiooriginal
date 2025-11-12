
import { z } from 'zod';

export const domainSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  domain_name: z.string(),
  verification_code: z.string().nullable(),
  is_verified: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Domain = z.infer<typeof domainSchema>;

export interface DnsChecks {
    id: string;
    domain_id: string;
    spf_verified: boolean;
    dkim_verified: boolean;
    dmarc_verified: boolean;
    mx_verified: boolean;
    bimi_verified: boolean;
    vmc_verified: boolean;
    dkim_public_key: string | null;
    created_at: string;
    updated_at: string;
}

export interface SmtpCredentials {
    id: string;
    domain_id: string;
    host: string;
    port: number;
    encryption: string;
    username: string;
    password: string; // WARNING: Storing plain text passwords is not recommended. Use Supabase Vault.
    is_validated: boolean;
    created_at: string;
    updated_at: string;
}
