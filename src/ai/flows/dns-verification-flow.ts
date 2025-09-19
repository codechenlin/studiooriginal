
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
  dkimPublicKey: z.string().describe('The expected DKIM public key for the "daybuu" selector.'),
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
      getTxtRecords(`daybuu._domainkey.${domain}`),
      getTxtRecords(`_dmarc.${domain}`),
    ]);

    const expertPrompt = ai.definePrompt({
        name: 'dnsHealthExpertPrompt',
        output: { schema: DnsHealthOutputSchema },
        prompt: `Eres un experto en DNS y entregabilidad de correo electrónico. Tu respuesta DEBE ser en español.
        Tu única tarea es analizar los registros SPF, DKIM y DMARC para el dominio {{domain}}. Ignora por completo cualquier otro registro TXT que no sea para SPF, DKIM o DMARC (ej. verificaciones de Google, Yandex, Bing, etc.).
        Todos los registros deben ser de tipo TXT.

        Configuración Ideal Esperada para los Registros Obligatorios:
        - Registro SPF:
            - Host/Nombre: @
            - Debe existir solo UN registro SPF. Si hay más de uno, es un error grave.
            - Valor del Registro debe contener las 3 cadenas siguientes: "v=spf1", "include:_spf.daybuu.com", y "-all".
            - Debes analizar la sintaxis completa. Si un usuario tiene otros servicios, aconséjale unificar los 'include' en un solo registro. Ejemplo: 'v=spf1 include:_spf.daybuu.com include:spf.otrodominio.com -all'

        - Registro DKIM:
            - Host/Nombre: daybuu._domainkey.{{domain}}
            - Pueden existir múltiples registros DKIM con diferentes selectores; tu trabajo es verificar únicamente el que corresponde a "daybuu".
            - Valor del Registro debe ser exactamente: "{{dkimPublicKey}}". Verifica que contenga "v=DKIM1;", "k=rsa;", y que la clave pública en "p=" coincida.

        - Registro DMARC:
            - Host/Nombre: _dmarc.{{domain}}
            - Debe existir solo UN registro DMARC.
            - Valor del Registro debe contener: "v=DMARC1;", "p=reject;", "pct=100;", "sp=reject;".
            - La etiqueta 'aspf' debe ser 's' o 'r'.
            - La etiqueta 'adkim' debe ser 's' o 'r'.

        Registros DNS Encontrados:
        - Registros encontrados en {{domain}} (para SPF): {{{spfRecords}}}
        - Registros encontrados en daybuu._domainkey.{{domain}} (para DKIM): {{{dkimRecords}}}
        - Registros encontrados en _dmarc.{{domain}} (para DMARC): {{{dmarcRecords}}}

        Tu Tarea (en español):
        1. Compara rigurosamente los registros encontrados con la configuración ideal. Un registro es "unverified" si existe pero no cumple con CUALQUIERA de las reglas (sintaxis, valores requeridos, unicidad, etc.).
        2. Determina el estado de cada registro (verified, unverified, not-found).
        3. Proporciona un análisis breve y claro en 'analysis'. Si todo es correcto, felicita al usuario. Si algo está mal, explica el problema específico y cómo solucionarlo de forma sencilla.
        4. Al mencionar el valor DKIM en tu análisis, NUNCA muestres la clave pública completa. Muestra solo el inicio, así: "v=DKIM1; k=rsa; p=MIIBIjA...".
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
