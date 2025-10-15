
'use server';
/**
 * @fileOverview An AI agent to verify and diagnose the health of a domain's DNS records for email.
 *
 * - verifyDnsHealth - A function that uses AI to analyze DNS records.
 * - DnsHealthInput - The input type for the verifyDnsHealth function.
 * - DnsHealthOutput - The return type for the verifyDnsHealth function.
 */

import { isDnsAnalysisEnabled, getAiConfigForFlows } from '@/ai/genkit';
import { z } from 'zod';
import dns from 'node:dns/promises';
import { deepseekChat } from '@/ai/deepseek';

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

export async function verifyDnsHealth(
  input: DnsHealthInput
): Promise<DnsHealthOutput | null> {
  if (!isDnsAnalysisEnabled()) {
    throw new Error('DNS analysis with AI is disabled by the administrator.');
  }

  const aiConfig = getAiConfigForFlows();
  if (!aiConfig || !aiConfig.enabled || aiConfig.provider !== 'deepseek' || !aiConfig.apiKey) {
      throw new Error('Deepseek AI is not configured or enabled.');
  }

  const { domain, dkimPublicKey } = input;

  const [txtRecords, dkimRecords, dmarcRecords] = await Promise.all([
    getTxtRecords(domain),
    getTxtRecords(`daybuu._domainkey.${domain}`),
    getTxtRecords(`_dmarc.${domain}`),
  ]);

  const prompt = `Analiza los registros DNS de un dominio y responde en español usando emojis. No incluyas enlaces a documentación externa. Tu respuesta DEBE ser un objeto JSON válido que cumpla con este esquema Zod:
\`\`\`json
{
  "type": "object",
  "properties": {
    "spfStatus": { "type": "string", "enum": ["verified", "unverified", "not-found"] },
    "dkimStatus": { "type": "string", "enum": ["verified", "unverified", "not-found"] },
    "dmarcStatus": { "type": "string", "enum": ["verified", "unverified", "not-found"] },
    "analysis": { "type": "string" }
  },
  "required": ["spfStatus", "dkimStatus", "dmarcStatus", "analysis"]
}
\`\`\`

Análisis del Registro SPF:

1.  **Identificación y Filtrado**: De todos los registros TXT proporcionados en 'txtRecords', considera únicamente aquellos que comiencen exactamente con la cadena "v=spf1 ". Ignora completamente cualquier otro registro TXT para el análisis de SPF.
2.  **Validación de Unicidad**: Una vez filtrados, si hay más de un registro que cumpla la condición anterior, la verificación falla ❌. Solo puede existir un único registro SPF.
3.  **Validación de Contenido**: Si existe un único registro SPF, verifica las siguientes reglas:
    *   Debe contener \`include:_spf.daybuu.com\`.
    *   Debe terminar con \`-all\`.
    *   Puede contener otros mecanismos como \`include:\`, \`ip4:\`, \`ip6:\`, \`a:\`, \`mx:\`.
4.  **Límite de Búsquedas DNS**: Si el registro SPF es válido, advierte al usuario sobre el límite de 10 búsquedas DNS. Explica que mecanismos como 'include' consumen búsquedas y que superar el límite causa fallos de entrega. Sugiere que si tiene muchos 'include', podría necesitar optimizarlo.
    *   **Ejemplo simple**: "Imagina que tienes una mochila con 10 espacios. Cada 'include' usa espacios. Si se llenan, ¡el SPF falla!".
    *   **Servicios comunes**: Menciona que servicios como Google Workspace o Microsoft 365 pueden usar muchas búsquedas por sí solos.
5.  **Resultado**: Si cumple todas las reglas, marca 'spfStatus' como 'verified' ✅. Si no, 'unverified' ❌. Si no se encuentra, 'not-found' 🧐.

Análisis del Registro DKIM:

1.  **Identificación**: Busca en 'dkimRecords' un registro para el selector 'daybuu._domainkey'.
2.  **Validación de Contenido**: El registro encontrado debe contener:
    *   La cadena \`v=DKIM1;\`
    *   La cadena \`k=rsa;\`
    *   Una cadena \`p=\` seguida de una clave pública.
3.  **Verificación de Clave**: Compara carácter por carácter la clave pública del registro DNS con la clave proporcionada en la variable 'dkimPublicKey'. Deben ser idénticas.
4.  **Seguridad en la Respuesta**: **NUNCA muestres la clave pública completa.** Si necesitas mencionarla, muestra solo los primeros 10 caracteres después de \`p=\` y añade puntos suspensivos. Ejemplo: \`p=MIIBIjANBg...\`.
5.  **Resultado**: Si el registro existe y la clave coincide, marca 'dkimStatus' como 'verified' ✅. Si existe pero algo no coincide, 'unverified' ❌. Si no existe, 'not-found' 🧐.

Análisis del Registro DMARC:

1.  **Identificación**: Busca en 'dmarcRecords' un registro para el host '_dmarc'. Solo puede existir uno.
2.  **Validación de Contenido**: El registro debe contener las siguientes cadenas y valores exactos:
    *   \`v=DMARC1;\`
    *   \`p=reject;\`
    *   \`pct=100;\` (Opcional, pero si existe debe ser 100)
    *   \`sp=reject;\`
    *   \`aspf=s;\` (o \`r\` para subdominios)
    *   \`adkim=s;\` (o \`r\` para subdominios)
3.  **Resultado**: Si el registro existe y cumple todas las reglas, marca 'dmarcStatus' como 'verified' ✅. Si existe pero algo no coincide, 'unverified' ❌. Si no existe, 'not-found' 🧐.

Formato de Respuesta:
Genera un análisis en formato de lista, explicando el estado de cada registro (SPF, DKIM, DMARC) de forma clara, directa y siempre usando emojis.

Registros a analizar:
- Dominio: ${domain}
- Clave DKIM esperada: ${dkimPublicKey}
- Registros TXT del dominio: ${txtRecords.join('\\n')}
- Registros DKIM (daybuu._domainkey): ${dkimRecords.join('\\n')}
- Registros DMARC (_dmarc): ${dmarcRecords.join('\\n')}
`;
  
  try {
    const rawResponse = await deepseekChat(prompt, {
      apiKey: aiConfig.apiKey,
      model: aiConfig.modelName,
    });
    
    // Extract JSON from the response
    const jsonMatch = rawResponse.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch || !jsonMatch[1]) {
      throw new Error("La IA no devolvió un JSON válido.");
    }
    
    const parsedJson = JSON.parse(jsonMatch[1]);
    const validatedOutput = DnsHealthOutputSchema.parse(parsedJson);

    return validatedOutput;
  } catch (error: any) {
    console.error('Error in DNS health check with Deepseek:', error);
    throw new Error(`Error al analizar la salud del DNS: ${error.message}`);
  }
}
