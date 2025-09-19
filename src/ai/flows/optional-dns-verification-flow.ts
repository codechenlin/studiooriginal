
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
        prompt: `Eres un experto en DNS y entregabilidad de correo electrónico. Tu respuesta DEBE ser en español.
        Tu única tarea es analizar los registros opcionales MX, BIMI y VMC para el dominio {{domain}}. Ignora cualquier otro registro.

        Configuración Ideal Esperada:
        - Registro MX: Puede haber múltiples registros MX. El estado es "verified" si al menos uno apunta a "foxmiu.email".
        - Registro BIMI: Debe ser un registro TXT en "default._bimi.{{domain}}" que contenga "v=BIMI1;". Solo puede haber un registro BIMI para el selector "default".
        - Registro VMC para BIMI: Para que un VMC sea válido, el mismo registro TXT de BIMI también debe contener una etiqueta "a=" que apunte a un certificado VMC.

        Registros DNS Encontrados:
        - Registros MX encontrados en {{domain}}: {{{mxRecords}}}
        - Registros TXT encontrados en default._bimi.{{domain}} (para BIMI y VMC): {{{bimiRecords}}}

        Tu Tarea (en español):
        1. Compara los registros encontrados con la configuración ideal.
        2. Determina el estado de cada registro (verified, unverified, not-found).
           - MX es "verified" si "foxmiu.email" está presente en al menos un registro.
           - BIMI es "verified" si "v=BIMI1;" está presente en el registro. Es "unverified" si existe el registro pero no contiene esta etiqueta.
           - VMC es "verified" si el registro contiene "v=BIMI1;" Y una etiqueta "a=". Es "unverified" si tiene BIMI pero no la etiqueta "a=".
        3. Proporciona un análisis breve y claro en 'analysis'. Explica el propósito de cada registro opcional y, si alguno está mal o falta, cómo solucionarlo.
        `
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
