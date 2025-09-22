
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
  analysis: z.string().describe('A natural language analysis of the optional records, explaining their purpose and how to fix them if they are misconfigured. Be concise and direct. Respond in Spanish and always use emojis.'),
});

async function withRetries<T>(
  fn: () => Promise<T>,
  retries: number = 2,
  delay: number = 1500
): Promise<T> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      if (error.message && error.message.includes('503')) {
        console.warn(`Attempt ${i + 1} failed with 503 error. Retrying in ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error; // Not a retriable error
      }
    }
  }
  console.error("Flow failed after multiple retries:", lastError);
  throw lastError;
}

export async function verifyOptionalDnsHealth(
  input: OptionalDnsHealthInput
): Promise<OptionalDnsHealthOutput | null> {
  try {
    return await withRetries(() => optionalDnsHealthCheckFlow(input));
  } catch (error) {
    console.error("Optional DNS flow execution failed after retries:", error);
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
      getTxtRecords(`daybuu._bimi.${domain}`),
    ]);

    const expertPrompt = ai.definePrompt({
        name: 'optionalDnsHealthExpertPrompt',
        output: { schema: OptionalDnsHealthOutputSchema },
        prompt: `Analiza los registros DNS opcionales de un dominio y responde en español usando emojis. No incluyas enlaces a documentación externa.

Análisis del Registro MX:

1.  **Identificación**: Busca en 'mxRecords' los registros para el dominio principal. Puede haber varios.
2.  **Validación**: Para que la verificación sea exitosa, al menos uno de los registros MX encontrados debe cumplir con estas dos condiciones simultáneamente:
    *   El Host/Nombre debe pertenecer al dominio principal (sin subdominios ni selectores).
    *   La propiedad 'exchange' debe ser exactamente \`daybuu.com\`.
    *   La propiedad 'priority' debe ser exactamente \`0\`.
3.  **Resultado**: 
    *   Si encuentras un registro que cumple ambas condiciones, marca 'mxStatus' como 'verified' ✅.
    *   Si existen registros MX pero ninguno cumple las condiciones, marca 'mxStatus' como 'unverified' ❌.
    *   Si no se encuentra ningún registro MX, marca 'mxStatus' como 'not-found' 🧐.

Análisis del Registro BIMI:

1.  **Identificación**: Busca en 'bimiRecords' un registro para el selector 'daybuu._bimi'. Solo puede existir uno con este selector.
2.  **Validación de Contenido**: El registro encontrado debe contener las siguientes cadenas:
    *   \`v=BIMI1;\`
    *   \`l=https:\` (para el enlace del logotipo). No valides el dominio de la URL del logo, solo la presencia de la etiqueta.
3.  **Resultado**: 
    *   Si el registro existe y contiene ambas cadenas, marca 'bimiStatus' como 'verified' ✅.
    *   Si existe pero falta alguna de las cadenas, 'unverified' ❌.
    *   Si no se encuentra, 'not-found' 🧐.

Análisis del Registro VMC:

1.  **Identificación**: El VMC es parte del registro BIMI. Busca dentro de 'bimiRecords' para el selector 'daybuu._bimi'.
2.  **Validación**: Para que un VMC se considere válido, el registro BIMI debe contener AMBAS cadenas:
    *   \`v=BIMI1;\`
    *   \`a=https:\` (esta es la parte del certificado VMC).
3.  **Contexto**: Explica que el VMC es un certificado digital que verifica la autenticidad de la marca y su logotipo. Es un complemento de seguridad para BIMI que aumenta la confianza y la probabilidad de que el logo se muestre en proveedores como Gmail.
4.  **Resultado**: 
    *   Si el registro existe y contiene ambas cadenas ('v=BIMI1;' y 'a=https:'), marca 'vmcStatus' como 'verified' ✅.
    *   Si el registro existe pero no contiene la cadena 'a=https:', marca 'vmcStatus' como 'unverified' ❌.
    *   Si no se encuentra ningún registro para 'daybuu._bimi', marca 'vmcStatus' como 'not-found' 🧐.

Registros a analizar:
- Dominio: {{{domain}}}
- Registros MX: {{{mxRecords}}}
- Registros BIMI (daybuu._bimi): {{{bimiRecords}}}
`,
    });

    const { output } = await expertPrompt({
        domain,
        mxRecords: mxRecords.map(r => `Prioridad: ${r.priority}, Servidor: ${r.exchange}`).join('; '),
        bimiRecords: bimiRecords.join('; '),
    });

    if (!output) {
      throw new Error("La IA no pudo generar un análisis para los registros opcionales.");
    }
    
    return output;
  }
);
