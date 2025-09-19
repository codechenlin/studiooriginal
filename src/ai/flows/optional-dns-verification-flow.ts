
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
        prompt: `Tu única tarea es analizar los registros DNS para MX, BIMI y VMC. Ignora cualquier otro registro. Si un registro es CNAME, márcalo como fallo. Responde en español.

        Registros DNS encontrados para el dominio {{domain}}:
        - Registros MX en {{domain}}: {{{mxRecords}}}
        - Registros TXT en default._bimi.{{domain}} (para BIMI y VMC): {{{bimiRecords}}}

        Sigue estas reglas estrictamente:

        1. MX:
        - Puede haber múltiples registros MX.
        - Host/Nombre debe ser @.
        - Para ser "verified", al menos UN registro debe apuntar a "daybuu.com" con prioridad 0.
        - Si existen registros MX pero ninguno cumple la condición, es "unverified". Si no hay registros MX, "not-found".

        2. BIMI:
        - Puede haber varios registros con diferentes selectores, pero nos enfocamos en 'default._bimi'.
        - El Host/Nombre debe ser "default._bimi.{{domain}}".
        - El valor del registro TXT debe contener "v=BIMI1;" y "l=https:".
        - Estado: "verified" si cumple, "unverified" si existe pero no cumple, "not-found" si no existe.

        3. VMC:
        - El VMC se verifica en el mismo registro que BIMI.
        - Para ser "verified", el registro TXT de BIMI debe contener "v=BIMI1;" Y ADEMÁS la etiqueta "a=https:".
        - Es "unverified" si existe un registro BIMI pero le falta la etiqueta "a=". Si no hay registro BIMI, VMC es "not-found".
        
        Análisis Final (en 'analysis'):
        - Sé conciso y directo.
        - Explica el propósito de cada registro opcional (MX para recibir correos, BIMI/VMC para mostrar logo y marca).
        - Si alguno está mal o falta, explica cómo solucionarlo.`
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
