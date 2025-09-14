
'use server';
/**
 * @fileOverview A flow to verify DNS TXT records for domain ownership.
 *
 * - verifyDns - A function that handles the DNS verification process.
 * - DnsVerificationInput - The input type for the verifyDns function.
 * - DnsVerificationOutput - The return type for the verifyDns function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import dns from 'node:dns/promises';

export const DnsVerificationInputSchema = z.object({
  domain: z.string().describe('The domain name to verify.'),
  expectedTxt: z
    .string()
    .describe('The full expected TXT record value, e.g., "domain.com,code=xyz123".'),
});
export type DnsVerificationInput = z.infer<typeof DnsVerificationInputSchema>;

export const DnsVerificationOutputSchema = z.object({
  isVerified: z.boolean().describe('Whether the DNS verification was successful.'),
  reason: z
    .string()
    .optional()
    .describe('The reason for verification failure, if applicable.'),
});
export type DnsVerificationOutput = z.infer<typeof DnsVerificationOutputSchema>;

export async function verifyDns(
  input: DnsVerificationInput
): Promise<DnsVerificationOutput> {
  return dnsVerificationFlow(input);
}

const dnsVerificationFlow = ai.defineFlow(
  {
    name: 'dnsVerificationFlow',
    inputSchema: DnsVerificationInputSchema,
    outputSchema: DnsVerificationOutputSchema,
  },
  async ({ domain, expectedTxt }) => {
    try {
      // The TXT record name is fixed for our service
      const txtRecordName = `_foxmiu-verification.${domain}`;
      const records = await dns.resolveTxt(txtRecordName);

      // dns.resolveTxt returns an array of arrays of strings (for multi-string records)
      // We need to flatten it to check for our value.
      const found = records.flat().some((record) => record === expectedTxt);

      if (found) {
        return {
          isVerified: true,
        };
      } else {
        return {
          isVerified: false,
          reason: `No se encontró el registro TXT esperado. Se esperaba '${expectedTxt}'. Asegúrese de que el registro se haya propagado.`,
        };
      }
    } catch (error: any) {
      // Common error codes: ENOTFOUND (domain not found), ENODATA (no TXT record for that name)
      if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
        return {
          isVerified: false,
          reason: `No se encontraron registros TXT para _foxmiu-verification.${domain}. Verifique el nombre del registro.`,
        };
      }
      console.error('DNS lookup error:', error);
      return {
        isVerified: false,
        reason: `Ocurrió un error al buscar DNS: ${error.message}. Por favor, inténtelo de nuevo más tarde.`,
      };
    }
  }
);
