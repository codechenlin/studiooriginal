
/**
 * @fileOverview Type definitions for the VMC Validator API flow.
 * This file does NOT use 'use server' and can export non-async objects.
 */
import { z } from 'genkit';

const DnsRecordSchema = z.object({
  name: z.string(),
  type: z.string(),
  values: z.array(z.any()),
});

const DnsInfoSchema = z.object({
  bimi: DnsRecordSchema.optional(),
  dmarc: DnsRecordSchema.optional(),
  mx: DnsRecordSchema.optional(),
  vmc_url_from_bimi: z.string().nullable().optional(),
});

const BimiInfoSchema = z.object({
  exists: z.boolean(),
  syntax_ok: z.boolean(),
  dmarc_enforced: z.boolean(),
  raw: z.string().nullable(),
});

const SvgInfoSchema = z.object({
  exists: z.boolean(),
  compliant: z.boolean(),
  sha256: z.string().nullable(),
  message: z.string(),
});

const OpenSslInfoSchema = z.object({
    status: z.enum(["pass", "fail", "error"]),
    format: z.string().nullable(),
    chain_ok: z.boolean().nullable(),
    detail: z.string().nullable(),
    stdout: z.string().nullable(),
    stderr: z.string().nullable(),
});

const VmcInfoSchema = z.object({
  exists: z.boolean(),
  authentic: z.boolean(),
  chain_ok: z.boolean(),
  valid_now: z.boolean(),
  revocation_ok: z.boolean().nullable(),
  ocsp_status: z.string().nullable(),
  crl_status: z.string().nullable(),
  vmc_logo_hash_present: z.boolean(),
  logo_hash_match: z.boolean().nullable(),
  message: z.string(),
  retry_suggestion: z.object({
    retry_after_seconds: z.number(),
    max_retries: z.number(),
  }).nullable().optional(),
  openssl: OpenSslInfoSchema.optional(),
});

export const VmcApiValidationInputSchema = z.object({
  domain: z.string().describe('The domain to validate.'),
});
export type VmcApiValidationInput = z.infer<typeof VmcApiValidationInputSchema>;

export const VmcApiValidationOutputSchema = z.object({
  domain: z.string(),
  dns: DnsInfoSchema,
  bimi: BimiInfoSchema,
  svg: SvgInfoSchema,
  vmc: VmcInfoSchema,
  status: z.enum(['pass', 'pass_without_vmc', 'indeterminate_revocation', 'fail', 'partial']),
  recommendations: z.record(z.any()).optional(),
});
export type VmcApiValidationOutput = z.infer<typeof VmcApiValidationOutputSchema>;
