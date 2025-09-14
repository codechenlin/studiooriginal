
'use server';
/**
 * @fileOverview A flow to verify DNS records for domain ownership and health.
 *
 * - verifyDns - A function that handles the DNS verification process.
 * - DnsVerificationInput - The input type for the verifyDns function.
 * - DnsVerificationOutput - The return type for the verifyDns function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import dns from 'node:dns/promises';

export type DnsVerificationInput = z.infer<typeof DnsVerificationInputSchema>;
const DnsVerificationInputSchema = z.object({
  domain: z.string().describe('The domain name to verify.'),
  recordType: z.enum(['TXT', 'MX', 'CNAME']),
  name: z.string().describe('The name of the record to look for.'),
  expectedValue: z.string().optional().describe('The expected value to find in the record.'),
});

export type DnsVerificationOutput = z.infer<typeof DnsVerificationOutputSchema>;
const DnsVerificationOutputSchema = z.object({
  isVerified: z.boolean().describe('Whether the DNS verification was successful.'),
  reason: z.string().optional().describe('The reason for verification failure, if applicable.'),
  foundRecords: z.array(z.string()).optional().describe('The records that were found.'),
});

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
  async ({ domain, recordType, name, expectedValue }) => {
    try {
      let fqdn = name;
      if (name === '@' || name === domain) {
        fqdn = domain;
      } else if (!name.endsWith(domain)) {
        fqdn = `${name}.${domain}`;
      }
      
      let records: string[] | dns.MxRecord[] | dns.SoaRecord | undefined;
      
      switch (recordType) {
        case 'TXT':
          records = (await dns.resolveTxt(fqdn)).flat();
          break;
        case 'MX':
          records = await dns.resolveMx(domain); // MX records are on the root domain
          break;
        case 'CNAME':
            records = await dns.resolveCname(fqdn);
            break;
        default:
          throw new Error(`Unsupported record type: ${recordType}`);
      }

      if (recordType === 'MX') {
        if (records && records.length > 0) {
            return { isVerified: true, foundRecords: (records as dns.MxRecord[]).map(r => `${r.priority} ${r.exchange}`) };
        }
        return { isVerified: false, reason: 'No se encontraron registros MX.' };
      }

      const flatRecords = Array.isArray(records) ? records.flat() : [records];
      
      if (!flatRecords || flatRecords.length === 0) {
        return { isVerified: false, reason: `No se encontraron registros ${recordType} para ${fqdn}.` };
      }

      if (expectedValue) {
        const found = flatRecords.some(record => record.includes(expectedValue));
        if (found) {
          return { isVerified: true, foundRecords: flatRecords };
        } else {
          return { isVerified: false, reason: `No se encontró el valor esperado.`, foundRecords: flatRecords };
        }
      }

      // If no expected value, just finding any record is a success.
      return { isVerified: true, foundRecords: flatRecords };

    } catch (error: any) {
      if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
        return {
          isVerified: false,
          reason: `No se encontraron registros ${recordType} para el nombre especificado.`,
        };
      }
      console.error('DNS lookup error:', error);
      return {
        isVerified: false,
        reason: `Ocurrió un error al buscar DNS: ${error.message}.`,
      };
    }
  }
);

    
