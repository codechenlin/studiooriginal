
'use server';
/**
 * @fileOverview Un agente de IA para verificar y diagnosticar la salud de los registros DNS de un dominio.
 *
 * - verifyDnsHealth - Una función que utiliza IA para analizar los registros DNS.
 * - DnsHealthInput - El tipo de entrada para la función verifyDnsHealth.
 * - DnsHealthOutput - El tipo de retorno para la función verifyDnsHealth.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import dns from 'node:dns/promises';

export type DnsHealthInput = z.infer<typeof DnsHealthInputSchema>;
const DnsHealthInputSchema = z.object({
  domain: z.string().describe('El nombre de dominio a verificar.'),
  dkimPublicKey: z.string().describe('La clave pública DKIM esperada para el selector "foxmiu".'),
});

export type DnsHealthOutput = z.infer<typeof DnsHealthOutputSchema>;
const DnsHealthOutputSchema = z.object({
  spfStatus: z.enum(['verified', 'unverified', 'not-found']).describe('Estado del registro SPF.'),
  dkimStatus: z.enum(['verified', 'unverified', 'not-found']).describe('Estado del registro DKIM.'),
  dmarcStatus: z.enum(['verified', 'unverified', 'not-found']).describe('Estado del registro DMARC.'),
  analysis: z.string().describe('Un análisis en lenguaje natural de los hallazgos, explicando qué está mal y cómo solucionarlo, si es necesario. Sé conciso y directo.'),
});

export async function verifyDnsHealth(
  input: DnsHealthInput
): Promise<DnsHealthOutput> {
  return dnsHealthCheckFlow(input);
}


const getTxtRecords = async (name: string): Promise<string[]> => {
  try {
    return (await dns.resolveTxt(name)).flat();
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
    
    // 1. Obtener todos los registros relevantes
    const [spfRecords, dkimRecords, dmarcRecords] = await Promise.all([
      getTxtRecords(domain),
      getTxtRecords(`foxmiu._domainkey.${domain}`),
      getTxtRecords(`_dmarc.${domain}`),
    ]);

    // 2. Definir el prompt del agente de IA
    const expertPrompt = ai.definePrompt({
        name: 'dnsHealthExpertPrompt',
        output: { schema: DnsHealthOutputSchema },
        prompt: `Eres un experto en DNS y entregabilidad de correo electrónico. Analiza los siguientes registros DNS para el dominio {{domain}}.

        Configuración Ideal Esperada:
        - Registro SPF: Debe ser un registro TXT que contenga "include:_spf.foxmiu.email".
        - Registro DKIM: Debe ser un registro TXT en "foxmiu._domainkey.{{domain}}" cuyo valor sea exactamente "{{dkimPublicKey}}".
        - Registro DMARC: Debe ser un registro TXT en "_dmarc.{{domain}}" que contenga la etiqueta "p=reject".

        Registros DNS Encontrados:
        - Registros encontrados en {{domain}} (para SPF): {{{spfRecords}}}
        - Registros encontrados en foxmiu._domainkey.{{domain}} (para DKIM): {{{dkimRecords}}}
        - Registros encontrados en _dmarc.{{domain}} (para DMARC): {{{dmarcRecords}}}

        Tu tarea:
        1. Compara los registros encontrados con la configuración ideal.
        2. Determina el estado de cada registro (verified, unverified, not-found). Un registro está "unverified" si existe pero no cumple con la configuración ideal.
        3. Proporciona un análisis breve y claro en 'analysis'. Si todo es correcto, felicita al usuario. Si algo está mal, explica el problema específico y cómo solucionarlo de forma sencilla.
        `
    });

    // 3. Invocar al agente de IA con los datos recopilados
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
