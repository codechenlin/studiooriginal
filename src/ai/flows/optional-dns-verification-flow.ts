
'use server';
/**
 * @fileOverview An AI agent to verify and diagnose the health of a domain's OPTIONAL DNS records.
 *
 * - verifyOptionalDnsHealth - A function that uses AI to analyze optional DNS records.
 * - OptionalDnsHealthInput - The input type for the verifyOptionalDnsHealth function.
 * - OptionalDnsHealthOutput - The return type for the verifyOptionalDnsHealth function.
 */

import { getAiConfigForFlows, getDnsConfigForFlows } from '@/ai/genkit';
import { z } from 'zod';
import dns from 'node:dns/promises';
import { deepseekChat } from '@/ai/deepseek';
import { VmcAnalysisInputSchema, VmcAnalysisOutputSchema, type VmcAnalysisInput, type VmcAnalysisOutput } from '@/app/dashboard/demo/types';

export type OptionalDnsHealthInput = VmcAnalysisInput;
export const OptionalDnsHealthInputSchema = VmcAnalysisInputSchema;

export type OptionalDnsHealthOutput = VmcAnalysisOutput;
export const OptionalDnsHealthOutputSchema = VmcAnalysisOutputSchema;


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

export async function verifyOptionalDnsHealth(
  input: OptionalDnsHealthInput
): Promise<OptionalDnsHealthOutput | null> {
  const aiConfig = getAiConfigForFlows();
  const dnsConfig = getDnsConfigForFlows();
  
  if (!aiConfig?.enabled || !aiConfig.functions?.dnsAnalysis) {
    throw new Error('DNS analysis with AI is disabled by the administrator.');
  }

  if (aiConfig.provider !== 'deepseek' || !aiConfig.apiKey) {
      throw new Error('Deepseek AI is not configured or enabled.');
  }

  const { domain } = input;
  const bimiSelector = dnsConfig.bimiSelector;
  
  const [mxRecords, bimiRecords] = await Promise.all([
    getMxRecords(domain),
    getTxtRecords(`${bimiSelector}._bimi.${domain}`),
  ]);

  const prompt = `Analiza los registros DNS opcionales de un dominio y responde en español usando emojis. No incluyas enlaces a documentación externa. Tu respuesta DEBE ser un objeto JSON válido que cumpla con este esquema Zod:
\`\`\`json
${JSON.stringify(OptionalDnsHealthOutputSchema.shape, null, 2)}
\`\`\`

Análisis del Registro MX:
1.  **Identificación**: Busca en 'mxRecords' los registros para el dominio principal.
2.  **Validación**: Para que mx_is_valid sea true, al menos un registro MX debe tener 'exchange' igual a \`${dnsConfig.mxTargetDomain}\` y 'priority' igual a \`0\`.
3.  **Resultado**: Si se encuentra dicho registro, 'mx_is_valid' es true ✅. Si no, false ❌.

Análisis del Registro BIMI:
1.  **Identificación**: Busca en 'bimiRecords' un registro para el selector '${bimiSelector}._bimi'.
2.  **Validación**: El registro debe contener 'v=BIMI1;'.
3.  **Resultado**: Si el registro existe y contiene la cadena, 'bimi_is_valid' es true ✅. Si no, false ❌.

Análisis del Certificado VMC:
1.  **Identificación**: Dentro del registro BIMI, busca la etiqueta 'a='.
2.  **Validación**: La presencia de la etiqueta 'a=' indica un VMC.
3.  **Resultado**: Si 'a=' existe, 'vmc_is_authentic' es true ✅. Si no, false ❌.

**Veredicto General y Puntuación:**
- **verdict**: Un resumen de una línea sobre el estado general.
- **validation_score**: Un puntaje de 0 a 100. 100 si todo es perfecto. 70 si BIMI es válido pero VMC no. 40 si MX es válido pero BIMI/VMC no. 0-20 si nada es válido.

**Análisis Detallado:**
- **detailed_analysis**: Explica en texto plano el estado de MX, BIMI y VMC, su propósito y cómo solucionar cualquier problema.

Registros a analizar:
- Dominio: ${domain}
- Registros MX: ${mxRecords.map(r => `Prioridad: ${r.priority}, Servidor: ${r.exchange}`).join('; ')}
- Registros BIMI (${bimiSelector}._bimi): ${bimiRecords.join('; ')}
`;
  
  try {
    const rawResponse = await deepseekChat(prompt, {
      apiKey: aiConfig.apiKey,
      model: aiConfig.modelName,
    });

    const jsonMatch = rawResponse.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch || !jsonMatch[1]) {
      const fallbackJsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if(!fallbackJsonMatch || !fallbackJsonMatch[0]) {
         throw new Error("La IA no devolvió un JSON válido.");
      }
      const parsedJson = JSON.parse(fallbackJsonMatch[0]);
      return OptionalDnsHealthOutputSchema.parse(parsedJson);
    }
    
    const parsedJson = JSON.parse(jsonMatch[1]);
    const validatedOutput = OptionalDnsHealthOutputSchema.parse(parsedJson);

    return validatedOutput;
  } catch (error: any) {
    console.error('Error in optional DNS health check with Deepseek:', error);
    throw new Error(`Error al analizar los registros DNS opcionales: ${error.message}`);
  }
}
