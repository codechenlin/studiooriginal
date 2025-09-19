
'use server';
/**
 * @fileOverview A flow to generate DKIM key pairs for domain verification.
 *
 * - generateDkimKeys - A function that handles the DKIM key generation process.
 * - DkimGenerationInput - The input type for the generateDkimKeys function.
 * - DkimGenerationOutput - The return type for the generateDkimKeys function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { generateKeyPair } from 'node:crypto';
import { promisify } from 'node:util';

const generateKeyPairAsync = promisify(generateKeyPair);

export type DkimGenerationInput = z.infer<typeof DkimGenerationInputSchema>;
const DkimGenerationInputSchema = z.object({
  domain: z.string().describe('The domain for which to generate DKIM keys.'),
  selector: z.string().default('daybuu').describe('The DKIM selector to use.'),
});

export type DkimGenerationOutput = z.infer<typeof DkimGenerationOutputSchema>;
const DkimGenerationOutputSchema = z.object({
  selector: z.string().describe('The DKIM selector.'),
  publicKeyRecord: z.string().describe('The full public key formatted for a DNS TXT record.'),
  privateKey: z.string().describe('The private key to be stored and used for signing.'),
});

export async function generateDkimKeys(input: DkimGenerationInput): Promise<DkimGenerationOutput> {
  return dkimGenerationFlow(input);
}

const dkimGenerationFlow = ai.defineFlow(
  {
    name: 'dkimGenerationFlow',
    inputSchema: DkimGenerationInputSchema,
    outputSchema: DkimGenerationOutputSchema,
  },
  async ({ domain, selector }) => {
    try {
      const { publicKey, privateKey } = await generateKeyPairAsync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
        },
      });

      // The public key needs to be stripped of headers/footers and newlines, then formatted for DNS.
      const publicKeyBase64 = publicKey
        .replace('-----BEGIN PUBLIC KEY-----', '')
        .replace('-----END PUBLIC KEY-----', '')
        .replace(/\r?\n|\r/g, '');
        
      const dnsRecordValue = `v=DKIM1; k=rsa; p=${publicKeyBase64}`;

      return {
        selector,
        publicKeyRecord: dnsRecordValue,
        privateKey, // In a real app, this would be encrypted and stored securely.
      };
    } catch (error: any) {
      console.error('DKIM Key Generation Error:', error);
      throw new Error(`Failed to generate DKIM keys: ${error.message}`);
    }
  }
);

    