
'use server';
/**
 * @fileOverview A flow to validate a domain's BIMI/VMC records using the external validator API.
 *
 * - validateVmcWithApi - A function that calls the external API and handles retry logic.
 * - VmcApiValidationInput - The input type for the function.
 * - VmcApiValidationOutput - The return type for the function, matching the API's JSON response.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import https from 'https';

const VmcApiValidationInputSchema = z.object({
  domain: z.string().describe('The domain to validate.'),
});
export type VmcApiValidationInput = z.infer<typeof VmcApiValidationInputSchema>;

// Define a comprehensive Zod schema based on the new API documentation
const VmcApiValidationOutputSchema = z.object({
  domain: z.string(),
  dns: z.object({
    bimi: z.object({
      name: z.string(),
      type: z.string(),
      values: z.array(z.string()).nullable(),
    }),
    dmarc: z.object({
        name: z.string(),
        type: z.string(),
        values: z.array(z.string()).nullable(),
    }),
    mx: z.object({
      exchanges: z.array(z.string()).nullable(),
      preferences: z.array(z.number()).nullable(),
    }),
  }),
  bimi: z.object({
    exists: z.boolean(),
    syntax_ok: z.boolean(),
    dmarc_enforced: z.boolean(),
    raw: z.string().optional(),
    vmc_url_from_bimi: z.string().url().nullable(),
  }),
  svg: z.object({
    exists: z.boolean(),
    compliant: z.boolean(),
    sha256: z.string().optional().nullable(),
    message: z.string(),
  }),
  vmc: z.object({
    exists: z.boolean(),
    authentic: z.boolean(),
    chain_ok: z.boolean(),
    valid_now: z.boolean(),
    revocation_ok: z.boolean().nullable(),
    ocsp_status: z.string().optional().nullable(),
    crl_status: z.string().optional().nullable(),
    vmc_logo_hash_present: z.boolean(),
    logo_hash_match: z.boolean().nullable(),
    message: z.string(),
    retry_suggestion: z.object({
        retry_after_seconds: z.number(),
        max_retries: z.number(),
    }).optional(),
  }),
  status: z.string(),
  recommendations: z.record(z.any()).optional(),
});
export type VmcApiValidationOutput = z.infer<typeof VmcApiValidationOutputSchema>;


const API_BASE = "https://8b3i4m6i39303g2k432u.fanton.cloud";

export async function validateVmcWithApi(input: VmcApiValidationInput): Promise<VmcApiValidationOutput> {
  return vmcValidatorApiFlow(input);
}

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const vmcValidatorApiFlow = ai.defineFlow(
  {
    name: 'vmcValidatorApiFlow',
    inputSchema: VmcApiValidationInputSchema,
    outputSchema: VmcApiValidationOutputSchema,
  },
  async ({ domain }) => {
    const API_KEY = process.env.VMC_VALIDATOR_API_KEY;
    if (!API_KEY) {
      throw new Error('VMC Validator API key is not configured.');
    }

    const headers = { "X-API-KEY": API_KEY, "User-Agent": "MailflowAI/1.0" };
    
    try {
        let response = await fetch(`${API_BASE}/validate?domain=${encodeURIComponent(domain)}`, { headers, agent: httpsAgent });

        if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
        }
        
        let jsonResponse = await response.json();
        
        const shouldRetryOnIndeterminate = jsonResponse.status === "indeterminate_revocation" && jsonResponse.vmc?.retry_suggestion;
        const shouldRetryOnDownloadError = /timeout|network/i.test(jsonResponse.vmc?.message) && jsonResponse.vmc?.retry_suggestion;


        if (shouldRetryOnIndeterminate || shouldRetryOnDownloadError) {
            const { retry_after_seconds, max_retries } = jsonResponse.vmc.retry_suggestion;
            
            for (let i = 0; i < max_retries; i++) {
                await new Promise(r => setTimeout(r, retry_after_seconds * 1000));
                
                const retryRes = await fetch(`${API_BASE}/validate?domain=${encodeURIComponent(domain)}`, { headers, agent: httpsAgent });
                const retryJson = await retryRes.json();
                
                // If revocation becomes OK, we have a definitive answer.
                if (retryJson.vmc?.revocation_ok === true) {
                    jsonResponse = retryJson;
                    break; 
                }
                
                // If it's no longer a download error, we also have a new state.
                if (shouldRetryOnDownloadError && !/timeout|network/i.test(retryJson.vmc?.message)) {
                    jsonResponse = retryJson;
                    break;
                }

                // If it's still indeterminate but we're on the last try, we keep the latest response.
                if (i === max_retries - 1) {
                    jsonResponse = retryJson;
                }
            }
        }
        
        // Validate the final response against the Zod schema
        const validatedOutput = VmcApiValidationOutputSchema.parse(jsonResponse);
        return validatedOutput;

    } catch (error: any) {
        console.error("VMC Validator API Flow Error:", error);
        throw new Error(`Failed to validate domain with VMC API: ${error.message}`);
    }
  }
);
