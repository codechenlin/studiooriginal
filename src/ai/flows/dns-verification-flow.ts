
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
        prompt: `Tu única tarea es analizar los registros DNS de tipo TXT para SPF, DKIM y DMARC. Ignora cualquier otro registro. Si un registro es CNAME, márcalo como fallo. Responde en español.

        Registros DNS encontrados para el dominio {{domain}}:
        - Registros TXT en {{domain}}: {{{spfRecords}}}
        - Registros TXT en daybuu._domainkey.{{domain}}: {{{dkimRecords}}}
        - Registros TXT en _dmarc.{{domain}}: {{{dmarcRecords}}}

        Sigue estas reglas estrictamente:

        1. SPF:
        - Identificación: Busca registros TXT en {{domain}} que empiecen EXACTAMENTE con "v=spf1". Si ninguno lo hace, el estado es "not-found".
        - Unicidad: SOLO puede existir UN registro SPF. Si encuentras más de uno que empiece con "v=spf1", es un error grave y el estado es "unverified".
        - Verificación de Contenido:
            - El Host/Nombre debe ser @.
            - Debe contener la cadena "include:_spf.daybuu.com".
            - Debe terminar EXACTAMENTE con "-all".
            - Puede contener otros mecanismos como 'a:', 'mx:', 'ip4:', 'ip6:', 'include:'. Esto es correcto y no es un error.
            - El número total de mecanismos (include, a, mx, etc.) no debe exceder los 8.
        - Estado: Si cumple todas las reglas, es "verified". Si existe pero falla en CUALQUIER regla (sintaxis, contenido, unicidad, etc.), es "unverified".

        2. DKIM:
        - Identificación: Busca registros TXT en daybuu._domainkey.{{domain}}.
        - Unicidad: Puede haber varios, pero para nuestra verificación, nos centramos en el selector 'daybuu'.
        - Verificación de Contenido:
            - El Host/Nombre debe ser "daybuu._domainkey.{{domain}}".
            - El valor debe contener "v=DKIM1;", "k=rsa;", y "p={{dkimPublicKey}}". Verifica que la clave pública coincida exactamente.
        - Estado: Si el registro para el selector 'daybuu' existe y es correcto, es "verified". Si existe pero es incorrecto, "unverified". Si no existe, "not-found".
        
        3. DMARC:
        - Identificación: Busca registros TXT en _dmarc.{{domain}}.
        - Unicidad: SOLO puede existir UN registro DMARC. Si hay más de uno, es "unverified".
        - Verificación de Contenido:
            - El Host/Nombre debe ser "_dmarc".
            - El valor debe contener "v=DMARC1;".
            - Debe contener "p=reject;".
            - Debe contener "pct=100;".
            - Debe contener "sp=reject;".
            - 'aspf' debe ser 's' o 'r'.
            - 'adkim' debe ser 's' o 'r'.
        - Estado: Si cumple todas las reglas, "verified". Si existe pero falla en alguna, "unverified". Si no existe, "not-found".

        Análisis Final (en 'analysis'):
        - Sé conciso y directo.
        - Si todo está correcto, felicita al usuario.
        - Si algo está mal, explica el problema específico (ej. "Tienes dos registros SPF, debes unificarlos en uno solo") y cómo solucionarlo.
        - Al mencionar el valor DKIM, NUNCA muestres la clave pública completa. Usa este formato: "v=DKIM1; k=rsa; p=MIIBIjA...".`
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
