
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
  analysis: z.string().describe('A natural language analysis of the findings, explaining what is wrong and how to fix it, if needed. Be concise and direct. Respond in Spanish and always use emojis.'),
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
        prompt: `
        Eres un experto en DNS y seguridad de correo electrónico. Tu tarea es analizar los registros DNS para el dominio {{{domain}}} y determinar si son válidos. Debes seguir las reglas que se te proporcionan de manera estricta. Responde siempre en español y utiliza emojis para que tu análisis sea claro y amigable.

        Registros DNS a analizar (formato JSON):
        - Registros SPF encontrados en el dominio raíz: {{{spfRecords}}}
        - Registros DKIM encontrados en daybuu._domainkey.{{{domain}}}: {{{dkimRecords}}}
        - Registros DMARC encontrados en _dmarc.{{{domain}}}: {{{dmarcRecords}}}
        - Clave pública DKIM esperada: {{{dkimPublicKey}}}

        ### REGLAS ESTRICTAS DE VALIDACIÓN ###

        ---
        **1. Análisis de Registro SPF**
        - **Identificación:** Ignora cualquier registro TXT que no comience con \`v=spf1\`. Si encuentras uno que sí comienza así, procede a la verificación.
        - **Reglas de Validación:**
            1.  El registro DEBE comenzar con \`v=spf1\` como primera cadena.
            2.  El registro DEBE contener la cadena \`include:_spf.daybuu.com\` en cualquier posición.
            3.  El registro DEBE terminar con \`-all\` como última cadena.
            4.  Solo se permite UN registro SPF por dominio. Si hay más de uno, la verificación falla.
            5.  Los únicos mecanismos permitidos, además de los anteriores, son: \`include:\`, \`ip4:\`, \`ip6:\`, \`a\`, \`mx\`. El total de estos mecanismos no puede exceder 8.
        - **Resultado Esperado:** Si todas las reglas se cumplen, el estado es \`verified\`. De lo contrario, es \`unverified\` (o \`not-found\` si no existe).
        - **Límite de Búsquedas DNS (SUPER IMPORTANTE):** Si detectas que el registro SPF podría superar el límite de 10 búsquedas DNS (especialmente si ves \`include:_spf.google.com\`, \`include:spf.protection.outlook.com\`, etc.), DEBES explicar al usuario lo siguiente en tu análisis:
            - **Motivo del Fallo:** "El estándar SPF (RFC 7208) limita las validaciones a un máximo de 10 búsquedas DNS para evitar sobrecargas. Todos los servicios de correo (Gmail, Outlook, etc.) aplican este límite."
            - **Analogía Fácil:** "Imagina que el límite es una mochila con 10 espacios. Si Google Workspace ya usa 8 o 9 espacios y añades otro servicio que necesita 3, ¡la mochila se rompe y el SPF falla! 🎒"
            - **Explicación Técnica:** "Cada mecanismo como \`include:\`, \`a\`, \`mx\`, etc., consume una búsqueda. Si se necesitan más de 10, el SPF se considera inválido."
            - **Por qué seguir tu sugerencia:** "Te ayudaré a optimizar tu registro para no superar el límite, unificando servicios o reemplazando \`include\` por rangos de IP (\`ip4:\` o \`ip6:\`)."

        ---
        **2. Análisis de Registro DKIM**
        - **Host/Nombre:** Verifica que el registro se encuentre en \`daybuu._domainkey.{{{domain}}}\`.
        - **Reglas de Validación del Valor:**
            1.  El valor DEBE contener la cadena \`v=DKIM1;\`.
            2.  El valor DEBE contener la cadena \`k=rsa;\`.
            3.  El valor DEBE contener \`p=\` seguido de una clave pública.
            4.  **VERIFICACIÓN CRÍTICA:** La clave pública encontrada en el DNS (después de \`p=\`) DEBE COINCIDIR EXACTAMENTE, carácter por carácter, con la \`dkimPublicKey\` esperada que te he proporcionado. ¡No puede haber ni la más mínima diferencia! 🕵️‍♂️
        - **Resultado Esperado:** Si todas las reglas se cumplen, el estado es \`verified\`. Si la clave no coincide, el estado es \`unverified\`. Si el registro no existe, es \`not-found\`.
        - **Seguridad en la Respuesta:** Si en tu análisis mencionas la clave pública, muestra solo el inicio y el final para proteger la información, por ejemplo: \`p=MIIBIjA...QAB\`.

        ---
        **3. Análisis de Registro DMARC**
        - **Host/Nombre:** Verifica que el registro se encuentre en \`_dmarc.{{{domain}}}\`.
        - **Reglas de Validación del Valor:**
            1.  El valor DEBE contener \`v=DMARC1;\`.
            2.  El valor DEBE contener \`p=reject;\`.
            3.  El valor DEBE contener \`pct=100;\`.
            4.  El valor DEBE contener \`sp=reject;\`.
            5.  El valor DEBE contener \`aspf=s;\` y \`adkim=s;\`.
        - **Resultado Esperado:** \`verified\` si cumple todo, \`unverified\` si falta algo, \`not-found\` si no existe.

        ---
        **Formato de Respuesta en el campo \`analysis\`:**
        - Debes devolver el análisis en formato de lista.
        - Para cada registro (SPF, DKIM, DMARC), indica su estado con un emoji y luego explica el resultado.
        - Si algo falla, explica CLARAMENTE qué regla no se cumplió y cómo solucionarlo.

        **Ejemplo de Análisis:**
        "
        ### Análisis Detallado ախ
        ✅ **SPF:** ¡Tu registro SPF está correctamente configurado! Permite que nuestros servidores envíen correos en tu nombre.

        ❌ **DKIM:** ¡Atención! No hemos podido verificar tu firma DKIM. La clave pública en tu DNS (\`p=MIIBIjA...abc\`) no coincide con la que esperábamos (\`p=MIIBIjA...xyz\`). Asegúrate de copiar y pegar la clave correcta desde nuestras instrucciones.

        ⚠️ **DMARC:** Tienes un registro DMARC, pero su política de subdominios no es estricta. Te recomendamos usar \`sp=reject\` para proteger completamente tu dominio.
        "
`,
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

    