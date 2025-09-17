
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
  recordType: z.enum(['TXT', 'MX', 'CNAME', 'SPF', 'DMARC']),
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
      
      let records: any[] = [];
      
      if (recordType === 'SPF' || recordType === 'DMARC' || recordType === 'TXT') {
        records = (await dns.resolveTxt(fqdn)).flat();
      } else if (recordType === 'MX') {
        records = await dns.resolveMx(domain);
      } else if (recordType === 'CNAME') {
        records = await dns.resolveCname(fqdn);
      } else {
        throw new Error(`Unsupported record type: ${recordType}`);
      }

      if (!records || records.length === 0) {
        return { isVerified: false, reason: `No se encontraron registros ${recordType} para ${fqdn}.` };
      }
      
      const processedRecords = records.map(r => 
        (typeof r === 'object' && recordType === 'MX') ? `${r.priority} ${r.exchange}` : r.toString()
      );

      switch (recordType) {
        case 'SPF':
            const spfRecord = processedRecords.join('');
            if (spfRecord.startsWith('v=spf1') && spfRecord.includes('include:_spf.foxmiu.email')) {
                return { isVerified: true, foundRecords: processedRecords };
            }
            return { isVerified: false, reason: "El registro SPF no incluye 'include:_spf.foxmiu.email'.", foundRecords: processedRecords };

        case 'DMARC':
            const dmarcRecord = processedRecords.join('');
            // Check for v=DMARC1 and specifically for p=reject.
            // Other policies like p=quarantine or p=none are not sufficient for our strict check.
            const hasRejectPolicy = /\bp=reject\b/.test(dmarcRecord.replace(/\s/g, ''));
            if (dmarcRecord.startsWith('v=DMARC1') && hasRejectPolicy) {
                return { isVerified: true, foundRecords: processedRecords };
            }
            return { isVerified: false, reason: "La política DMARC no está establecida en 'p=reject'.", foundRecords: processedRecords };
        
        case 'CNAME': // Used for DKIM
            if(records.length > 0) {
                return { isVerified: true, foundRecords: records };
            }
            return { isVerified: false, reason: 'No se encontró el registro CNAME para DKIM.', foundRecords: records };

        case 'MX':
            if (processedRecords.some(r => r.includes(expectedValue || ''))) {
                return { isVerified: true, foundRecords: processedRecords };
            }
            return { isVerified: false, reason: `No se encontró '${expectedValue}' en los registros MX.`, foundRecords: processedRecords };

        case 'TXT': // For domain verification
          if (processedRecords.includes(expectedValue || '')) {
            return { isVerified: true, foundRecords: processedRecords };
          }
          return { 
            isVerified: false, 
            reason: `No se encontró el valor de verificación esperado.`, 
            foundRecords: processedRecords
          };

        default:
           return { isVerified: true, foundRecords: processedRecords };
      }

    } catch (error: any) {
      if (error.code === 'ENODATA' || error.code === 'ENOTFOUND' || error.code === 'DNS_SETTING_EMPTY') {
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
