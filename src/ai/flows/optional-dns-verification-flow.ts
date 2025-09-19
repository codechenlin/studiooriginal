
'use server';
/**
 * @fileOverview An AI agent to verify and diagnose the health of a domain's OPTIONAL DNS records.
 *
 * - verifyOptionalDnsHealth - A function that uses AI to analyze optional DNS records.
 * - OptionalDnsHealthInput - The input type for the verifyOptionalDnsHealth function.
 * - OptionalDnsHealthOutput - The return type for the verifyOptionalDnsHealth function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import dns from 'node:dns/promises';

export type OptionalDnsHealthInput = z.infer<typeof OptionalDnsHealthInputSchema>;
const OptionalDnsHealthInputSchema = z.object({
  domain: z.string().describe('The domain name to check.'),
});

export type OptionalDnsHealthOutput = z.infer<typeof OptionalDnsHealthOutputSchema>;
const OptionalDnsHealthOutputSchema = z.object({
  mxStatus: z.enum(['verified', 'unverified', 'not-found']).describe('Status of the MX record.'),
  bimiStatus: z.enum(['verified', 'unverified', 'not-found']).describe('Status of the BIMI record.'),
  vmcStatus: z.enum(['verified', 'unverified', 'not-found']).describe('Status of the VMC record.'),
  analysis: z.string().describe('A natural language analysis of the optional records, explaining their purpose and how to fix them if they are misconfigured. Be concise and direct. Respond in Spanish.'),
});

export async function verifyOptionalDnsHealth(
  input: OptionalDnsHealthInput
): Promise<OptionalDnsHealthOutput | null> {
  try {
    return await optionalDnsHealthCheckFlow(input);
  } catch (error) {
    console.error("Optional DNS flow execution failed:", error);
    throw error;
  }
}

const getTxtRecords = async (name: string): Promise<string[]> => {
  try {
    const records = await dns.resolveTxt(name);
    return records.map(rec => rec.join(''));
  } catch (error: any) {
    if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
      return [];
    }
    throw error;
  }
};

const getMxRecords = async (domain: string): Promise<dns.MxRecord[]> => {
    try {
        return await dns.resolveMx(domain);
    } catch (error: any) {
        if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
            return [];
        }
        throw error;
    }
}


const optionalDnsHealthCheckFlow = ai.defineFlow(
  {
    name: 'optionalDnsHealthCheckFlow',
    inputSchema: OptionalDnsHealthInputSchema,
    outputSchema: OptionalDnsHealthOutputSchema,
  },
  async ({ domain }) => {
    
    const [mxRecords, bimiRecords] = await Promise.all([
      getMxRecords(domain),
      getTxtRecords(`default._bimi.${domain}`),
    ]);

    const expertPrompt = ai.definePrompt({
        name: 'optionalDnsHealthExpertPrompt',
        output: { schema: OptionalDnsHealthOutputSchema },
        prompt: `Instrucción para la IA: Analiza y verifica únicamente los registros DNS para MX, BIMI y VMC. Ignora cualquier otro tipo de registro. Si un registro es de tipo CNAME, márcalo como fallo. Responde en español y usa emojis (✅, ❌, ⚠️).

        Registros DNS encontrados para el dominio {{domain}}:
        - Registros MX en {{domain}}: {{{mxRecords}}}
        - Registros TXT en default._bimi.{{domain}} (para BIMI y VMC): {{{bimiRecords}}}

        Reglas de verificación por tipo:

        1. MX
        - Puede haber múltiples registros MX en el mismo dominio. No se unifican.
        - Host/Nombre debe ser "@".
        - Para ser verificado, al menos un registro debe tener el valor "daybuu.com" con prioridad 0.

        2. BIMI
        - Puede haber varios registros BIMI en el mismo dominio, cada uno con un selector diferente. Nos enfocamos en 'default._bimi'.
        - No se unifican.
        - Solo se permite un logotipo por dominio.
        - El valor del registro TXT debe contener: "v=BIMI1;" y "l=https:".

        3. VMC
        - Se verifica en el mismo registro que BIMI pero es un estándar diferente.
        - El valor del registro TXT debe contener "v=BIMI1;" y, adicionalmente, la etiqueta "a=https:".
        - Solo se permite un certificado VMC por dominio.

        Instrucciones Adicionales:
        - No analices ni respondas sobre registros que no sean MX, BIMI o VMC.
        - Cumple estrictamente con las reglas para determinar si un registro es válido.
        - En el análisis, explica el propósito de cada registro opcional (MX para recibir correos, BIMI para mostrar logo, VMC para validación de marca con logo) y cómo solucionar cualquier problema.`
    });

    const { output } = await expertPrompt({
        domain,
        mxRecords: JSON.stringify(mxRecords),
        bimiRecords: JSON.stringify(bimiRecords),
    });

    if (!output) {
      throw new Error("La IA no pudo generar un análisis para los registros opcionales.");
    }
    
    return output;
  }
);

    
