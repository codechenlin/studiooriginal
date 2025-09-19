
'use server';
/**
 * @fileOverview An AI agent to verify and diagnose the health of a domain's DNS records for email.
 *
 * - verifyDnsHealth - A function that uses AI to analyze DNS records.
 * - DnsHealthInput - The input type for the verifyDnsHealth function.
 * - DnsHealthOutput - The return type for the verifyDnsHealth function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import dns from 'node:dns/promises';

export type DnsHealthInput = z.infer<typeof DnsHealthInputSchema>;
const DnsHealthInputSchema = z.object({
  domain: z.string().describe('The domain name to check.'),
  dkimPublicKey: z.string().describe('The expected DKIM public key for the "foxmiu" selector.'),
});

export type DnsHealthOutput = z.infer<typeof DnsHealthOutputSchema>;
const DnsHealthOutputSchema = z.object({
  spfStatus: z.enum(['verified', 'unverified', 'not-found']).describe('Status of the SPF record.'),
  dkimStatus: z.enum(['verified', 'unverified', 'not-found']).describe('Status of the DKIM record.'),
  dmarcStatus: z.enum(['verified', 'unverified', 'not-found']).describe('Status of the DMARC record.'),
  analysis: z.string().describe('A natural language analysis of the findings, explaining what is wrong and how to fix it, if needed. Be concise and direct.'),
});

export async function verifyDnsHealth(
  input: DnsHealthInput
): Promise<DnsHealthOutput | null> {
  try {
    return await dnsHealthCheckFlow(input);
  } catch (error) {
    console.error("Flow execution failed:", error);
    // Propagate the original error message
    throw error;
  }
}

const getTxtRecords = async (name: string): Promise<string[]> => {
  try {
    // resolveTxt can return string[][]
    const records = await dns.resolveTxt(name);
    // Flatten and join to handle split TXT records
    return records.map(rec => rec.join(''));
  } catch (error: any) {
    if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
      return [];
    }
    // Re-throw other errors
    throw error;
  }
};


const dnsHealthCheckFlow = ai.defineFlow(
  {
    name: 'dnsHealthCheckFlow',
    inputSchema: DnsHealthInputSchema,
    outputSchema: DnsHealthOutputSchema,
  },
  async ({ domain, dkimPublicKey }) => {
    
    const [spfRecords, dkimRecords, dmarcRecords] = await Promise.all([
      getTxtRecords(domain),
      getTxtRecords(`foxmiu._domainkey.${domain}`),
      getTxtRecords(`_dmarc.${domain}`),
    ]);

    const expertPrompt = ai.definePrompt({
        name: 'dnsHealthExpertPrompt',
        output: { schema: DnsHealthOutputSchema },
        prompt: `Eres un experto en DNS y entregabilidad de correo electrónico. Tu respuesta DEBE ser en español.
        Tu única tarea es analizar los registros SPF, DKIM y DMARC para el dominio {{domain}}. Ignora por completo cualquier otro registro TXT que no sea para SPF, DKIM o DMARC (ej. verificaciones de Google, Yandex, Bing, etc).

        Configuración Ideal Esperada:
        - Registro SPF: Debe ser un registro TXT en el dominio raíz que contenga "include:_spf.foxmiu.email". Solo puede haber un registro SPF. Si hay más de uno, es un error.
        - Registro DKIM: Debe ser un registro TXT en "foxmiu._domainkey.{{domain}}" con el valor exacto de "{{dkimPublicKey}}". Un dominio puede tener múltiples registros DKIM con diferentes selectores; tu trabajo es verificar únicamente el que corresponde a "foxmiu".
        - Registro DMARC: Debe ser un registro TXT en "_dmarc.{{domain}}" que contenga la etiqueta "p=reject". Una política de "quarantine" o "none" no es suficientemente segura y debe marcarse como no verificada. Solo puede haber un registro DMARC.

        Registros DNS Encontrados:
        - Registros encontrados en {{domain}} (para SPF): {{{spfRecords}}}
        - Registros encontrados en foxmiu._domainkey.{{domain}} (para DKIM): {{{dkimRecords}}}
        - Registros encontrados en _dmarc.{{domain}} (para DMARC): {{{dmarcRecords}}}

        Tu Tarea (en español):
        1. Compara los registros encontrados con la configuración ideal. Un registro es "unverified" si existe pero no cumple con la configuración ideal (ej., DMARC tiene p=quarantine, o hay múltiples registros SPF).
        2. Determina el estado de cada registro (verified, unverified, not-found).
        3. Proporciona un análisis breve y claro en 'analysis'. Si todo es correcto, felicita al usuario. Si algo está mal, explica el problema específico y cómo solucionarlo de forma sencilla.
        4. Al mencionar el valor DKIM en tu análisis, NUNCA muestres la clave pública completa. Muestra solo el inicio y el final, así: "v=DKIM1; k=rsa; p=MIIBIjAN...QAB".
        `
    });

    const { output } = await expertPrompt({
        domain,
        dkimPublicKey,
        spfRecords: JSON.stringify(spfRecords),
        dkimRecords: JSON.stringify(dkimRecords),
        dmarcRecords: JSON.stringify(dmarcRecords),
    });

    if (!output) {
      throw new Error("La IA no pudo generar un análisis.");
    }
    
    return output;
  }
);
