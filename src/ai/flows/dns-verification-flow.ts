
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
      
      // Normalize TXT records by joining and removing quotes
      const processedRecords = records.map(r => {
        if (typeof r === 'string') return r.replace(/"/g, '');
        if(recordType === 'MX' && typeof r === 'object') return `${r.priority} ${r.exchange}`;
        return r.toString();
      });
      
      const joinedTxtRecords = processedRecords.join('');

      switch (recordType) {
        case 'SPF':
          if (joinedTxtRecords.includes('include:_spf.foxmiu.email')) {
            return { isVerified: true, foundRecords: processedRecords };
          }
          return { isVerified: false, reason: "El registro SPF no incluye 'include:_spf.foxmiu.email', que es necesario para nuestra plataforma.", foundRecords: processedRecords };

        case 'DMARC':
          if (joinedTxtRecords.includes('p=reject')) {
            return { isVerified: true, foundRecords: processedRecords };
          }
          return { isVerified: false, reason: "El registro DMARC no tiene la política estricta 'p=reject' recomendada.", foundRecords: processedRecords };
        
        case 'MX':
            if (processedRecords.some(r => r.includes('foxmiu.email'))) {
                return { isVerified: true, foundRecords: processedRecords };
            }
            return { isVerified: false, reason: "No se encontró 'foxmiu.email' en los registros MX. No podrás recibir correos en nuestros servidores.", foundRecords: processedRecords };

        case 'TXT': 
        case 'CNAME':
          if (!expectedValue) {
            return { isVerified: true, foundRecords: processedRecords }; // Existence check is enough
          }
          if (processedRecords.some(r => r.includes(expectedValue))) {
            return { isVerified: true, foundRecords: processedRecords };
          }
          return { 
            isVerified: false, 
            reason: `No se encontró el valor esperado '${expectedValue}' en los registros encontrados.`, 
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
