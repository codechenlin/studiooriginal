
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
        prompt: `
        Eres un experto en DNS y reputación de marca por correo electrónico. Analiza los siguientes registros DNS opcionales para el dominio {{{domain}}} y explica su propósito y estado. Responde siempre en español y utiliza emojis para que tu análisis sea claro y amigable.

        Registros DNS a analizar (formato JSON):
        - Registros MX encontrados en el dominio raíz: {{{mxRecords}}}
        - Registros BIMI/VMC encontrados en default._bimi.{{{domain}}}: {{{bimiRecords}}}

        ### REGLAS ESTRICTAS DE VALIDACIÓN ###

        ---
        **1. Análisis de Registro MX**
        - **Host/Nombre:** Debe estar en \`@\` (el dominio raíz).
        - **Reglas de Validación:**
            1.  Debe existir al menos un registro MX.
            2.  El valor (el campo \`exchange\`) de al menos un registro DEBE ser \`daybuu.com\`.
            3.  La prioridad debe ser \`0\`.
        - **Resultado Esperado:** \`verified\` si cumple todo, \`unverified\` si algo falla, \`not-found\` si no existe.

        ---
        **2. Análisis de Registro BIMI**
        - **Host/Nombre:** Debe ser \`default._bimi\`.
        - **Reglas de Validación:**
            1.  El valor DEBE contener \`v=BIMI1;\`.
            2.  El valor DEBE contener una etiqueta \`l=https://...\` apuntando a una URL de un archivo SVG.
        - **Resultado Esperado:** \`verified\` si cumple todo. Si no, \`unverified\` o \`not-found\`.

        ---
        **3. Análisis de Certificado VMC (dentro de BIMI)**
        - **Host/Nombre:** Utiliza el mismo registro BIMI.
        - **Reglas de Validación:**
            1.  El registro BIMI DEBE contener una etiqueta \`a=\` apuntando a una URL de un certificado .pem.
        - **Resultado Esperado:** \`verified\` si la etiqueta \`a=\` existe y contiene una URL. \`unverified\` si la etiqueta \`a=\` está presente pero vacía. \`not-found\` si la etiqueta \`a=\` no existe en el registro BIMI.

        ---
        **Formato de Respuesta en el campo \`analysis\`:**
        - Debes devolver el análisis en formato de lista.
        - Para cada registro (MX, BIMI, VMC), explica brevemente su propósito, indica su estado con un emoji y, si falla, explica por qué.

        **Ejemplo de Análisis:**
        "
        ### Análisis de Registros Opcionales ✨
        ✅ **MX:** ¡Configurado! Este registro le dice al mundo que nuestros servidores reciben correos para tu dominio.

        🖼️ **BIMI:** ¡Encontrado! Este registro permite que tu logo aparezca en la bandeja de entrada de tus clientes, ¡genial para el reconocimiento de marca!

        ❌ **VMC:** No hemos encontrado un Certificado de Marca Verificada (VMC) en tu registro BIMI. La etiqueta \`a=\` falta. Aunque es opcional, añadirlo aumenta aún más la confianza y es requerido por proveedores como Gmail para mostrar tu logo.
        "
`,
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

    