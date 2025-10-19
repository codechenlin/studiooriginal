
'use server';
/**
 * @fileOverview A flow to validate a domain's BIMI, SVG, and VMC records using an external API.
 *
 * - validateVmcWithApi - A function that handles the domain validation process, including retry logic.
 */

import { ai } from '@/ai/genkit';
import { VmcApiValidationInputSchema, VmcApiValidationOutputSchema, type VmcApiValidationInput, type VmcApiValidationOutput } from './vmc-validator-api-types';

const API_BASE = "https://8b3i4m6i39303g2k432u.fanton.cloud";
const API_KEY = process.env.VMC_VALIDATOR_API_KEY;

async function callApi(domain: string): Promise<VmcApiValidationOutput> {
  if (!API_KEY) {
    throw new Error('VMC Validator API key is not configured.');
  }

  const url = `${API_BASE}/validate?domain=${encodeURIComponent(domain)}`;
  const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'User-Agent': 'MailflowAI-Validation-Client/1.0',
    'Accept': 'application/json',
  };

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`API returned an error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return VmcApiValidationOutputSchema.parse(result);
  } catch (error: any) {
    console.error('Failed to validate domain with VMC API:', error);
    throw new Error(`Failed to validate domain with VMC API: ${error.message}`);
  }
}

const vmcValidatorFlow = ai.defineFlow(
  {
    name: 'vmcValidatorApiFlow',
    inputSchema: VmcApiValidationInputSchema,
    outputSchema: VmcApiValidationOutputSchema,
  },
  async ({ domain }) => {
    let result = await callApi(domain);

    // Implement retry logic for indeterminate revocation status
    if (result.status === 'indeterminate_revocation' && result.vmc.retry_suggestion) {
      const { retry_after_seconds, max_retries } = result.vmc.retry_suggestion;

      for (let i = 0; i < max_retries; i++) {
        await new Promise(r => setTimeout(r, retry_after_seconds * 1000));
        const retryResult = await callApi(domain);

        if (retryResult.vmc.revocation_ok === true) {
          return retryResult; // Success, return the new result
        }
        // Update result to keep the latest state in case all retries fail
        result = retryResult;
        if (result.status !== 'indeterminate_revocation') {
          break; // Exit loop if status changes
        }
      }
    }

    // Also handle retry for VMC download timeout/network errors
    if (result.status === 'fail' && result.vmc.message.includes('No se pudo descargar el VMC') && (result.vmc.message.includes('timeout') || result.vmc.message.includes('red'))) {
      for (let i = 0; i < 2; i++) { // Retry up to 2 times for network issues
        await new Promise(r => setTimeout(r, (i + 1) * 2000)); // wait 2, then 4 seconds
        const retryResult = await callApi(domain);
        if (retryResult.status !== 'fail' || !retryResult.vmc.message.includes('No se pudo descargar el VMC')) {
          return retryResult; // If it's no longer a download error, return result
        }
        result = retryResult;
      }
    }

    return result;
  }
);


export async function validateVmcWithApi(input: VmcApiValidationInput): Promise<VmcApiValidationOutput> {
  return vmcValidatorFlow(input);
}
