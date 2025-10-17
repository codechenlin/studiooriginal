
'use server';
/**
 * @fileOverview An AI agent to validate the authenticity of a domain's BIMI and VMC records.
 *
 * - verifyVmcAuthenticity - A function that uses AI to analyze BIMI, DMARC, SVG, and PEM certificate data.
 * - VmcVerificationInput - The input type for the verifyVmcAuthenticity function.
 * - VmcVerificationOutput - The return type for the verifyVmcAuthenticity function.
 */

import { getAiConfigForFlows } from '@/ai/genkit';
import { z } from 'zod';
import dns from 'node:dns/promises';
import { deepseekChat } from '@/ai/deepseek';

export type VmcVerificationInput = z.infer<typeof VmcVerificationInputSchema>;
const VmcVerificationInputSchema = z.object({
  domain: z.string().describe('The domain name to check.'),
  selector: z.string().default('default').describe('The BIMI selector to use (e.g., "default").'),
});

export type VmcVerificationOutput = z.infer<typeof VmcVerificationOutputSchema>;
const VmcVerificationOutputSchema = z.object({
  bimiRecordValid: z.boolean().describe('Whether a valid BIMI record was found.'),
  dmarcPolicyOk: z.boolean().describe('Whether the DMARC policy is strict enough (quarantine or reject).'),
  svgSecure: z.boolean().describe('Whether the SVG logo is secure and meets BIMI specifications.'),
  vmcChainValid: z.boolean().describe('Whether the PEM certificate chain is valid and trusted.'),
  vmcIdentityMatch: z.boolean().describe('Whether the organization in the VMC matches the domain.'),
  overallStatus: z.enum(['verified', 'unverified', 'not-found']).describe('The overall verification status.'),
  analysis: z.string().describe('A detailed, step-by-step natural language analysis of the findings, explaining what is right, what is wrong, and how to fix it. Respond in Spanish and always use emojis.'),
});

const getTxtRecords = async (name: string): Promise<string[]> => {
  try {
    const records = await dns.resolveTxt(name);
    return records.flat(); // Flatten the array of arrays
  } catch (error: any) {
    if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
      return [];
    }
    // Re-throw other errors to be caught by the main try-catch
    console.error(`DNS lookup failed for ${name}:`, error);
    throw new Error(`DNS lookup for ${name} failed: ${error.message}`);
  }
};

const fetchUrlContent = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
            return `Error: Failed to fetch with status ${response.status}`;
        }
        return await response.text();
    } catch (error: any) {
        console.error(`Error fetching content from ${url}:`, error);
        return `Error: ${error.message}`;
    }
}

export async function verifyVmcAuthenticity(
  input: VmcVerificationInput
): Promise<VmcVerificationOutput | null> {
  const aiConfig = getAiConfigForFlows();
  
  if (!aiConfig?.enabled || !aiConfig.functions?.vmcVerification) {
    throw new Error('VMC verification with AI is disabled by the administrator.');
  }

  if (aiConfig.provider !== 'deepseek' || !aiConfig.apiKey) {
      throw new Error('Deepseek AI is not configured or enabled.');
  }

  const { domain, selector } = input;

  let dmarcRecords: string[] = [];
  let bimiRecord: string | undefined;
  let svgUrl = '';
  let pemUrl = '';
  let svgContent = '';
  let pemContent = '';
  
  try {
    [dmarcRecords, bimiRecord] = await Promise.all([
      getTxtRecords(`_dmarc.${domain}`),
      getTxtRecords(`${selector}._bimi.${domain}`).then(records => records[0]) // Get the first BIMI record if it exists
    ]);

    if (bimiRecord && bimiRecord.includes('v=BIMI1')) {
      const lMatch = bimiRecord.match(/l=([^;]+)/);
      svgUrl = lMatch ? lMatch[1] : '';

      const aMatch = bimiRecord.match(/a=([^;]+)/);
      pemUrl = aMatch ? aMatch[1] : '';

      const contentPromises = [];
      if (svgUrl) contentPromises.push(fetchUrlContent(svgUrl));
      if (pemUrl) contentPromises.push(fetchUrlContent(pemUrl));
      
      const [fetchedSvgContent, fetchedPemContent] = await Promise.all(contentPromises);

      svgContent = fetchedSvgContent || '';
      pemContent = fetchedPemContent || '';
    }

  } catch(e: any) {
     console.error("An error occurred during DNS resolution or content fetching:", e);
     // We will still pass this to the AI to analyze why it might have failed.
     svgContent = svgContent || `Failed to fetch: ${e.message}`;
     pemContent = pemContent || `Failed to fetch: ${e.message}`;
  }


  const prompt = `Actúa como un experto en ciberseguridad y DNS. Valida la autenticidad de un registro BIMI/VMC para un dominio. Responde en español y usa emojis. Tu respuesta DEBE ser un objeto JSON válido que cumpla este esquema Zod:
\`\`\`json
{
  "type": "object",
  "properties": {
    "bimiRecordValid": { "type": "boolean" },
    "dmarcPolicyOk": { "type": "boolean" },
    "svgSecure": { "type": "boolean" },
    "vmcChainValid": { "type": "boolean" },
    "vmcIdentityMatch": { "type": "boolean" },
    "overallStatus": { "type": "string", "enum": ["verified", "unverified", "not-found"] },
    "analysis": { "type": "string" }
  },
  "required": ["bimiRecordValid", "dmarcPolicyOk", "svgSecure", "vmcChainValid", "vmcIdentityMatch", "overallStatus", "analysis"]
}
\`\`\`

Realiza las siguientes validaciones paso a paso:

1.  **Registro BIMI (bimiRecordValid)**:
    *   Verifica que el \`bimiRecord\` exista y contenga \`v=BIMI1;\`.
    *   Debe tener una URL de logo en \`l=\` y una URL de certificado VMC en \`a=\`. Si alguna falta, marca como inválido.
    *   Resultado: \`true\` si todo es correcto, sino \`false\`.

2.  **Política DMARC (dmarcPolicyOk)**:
    *   Analiza el \`dmarcRecord\`. La política \`p=\` debe ser \`quarantine\` o \`reject\`. Una política \`p=none\` no es válida para BIMI.
    *   Resultado: \`true\` si la política es estricta, sino \`false\`.

3.  **Seguridad del SVG (svgSecure)**:
    *   Analiza el \`svgContent\`. Si contiene un error de fetch, es inválido.
    *   Debe ser un archivo SVG válido y cumplir con la especificación "SVG Tiny P/S".
    *   **Prohibido**: No debe contener scripts, referencias a archivos externos (excepto a los espacios de nombre de W3C), ni elementos interactivos.
    *   Resultado: \`true\` si es un SVG seguro y válido, sino \`false\`.

4.  **Cadena de Confianza del VMC (vmcChainValid)**:
    *   Analiza el \`pemContent\`. Si contiene un error de fetch, es inválido.
    *   Debe ser un certificado X.509 válido en formato PEM.
    *   Valida su firma digital y su cadena de confianza. Debe estar emitido por una Autoridad de Certificación (CA) de confianza para VMC, como **DigiCert** o **Entrust**.
    *   Verifica que no esté expirado.
    *   Resultado: \`true\` si la cadena es válida y confiable, sino \`false\`.

5.  **Identidad del VMC (vmcIdentityMatch)**:
    *   Dentro del \`pemContent\`, extrae el campo "Subject" (Sujeto) y busca el nombre de la organización (\`O=\`).
    *   Compara el nombre de esa organización con el dominio principal. Deben estar razonablemente relacionados. Por ejemplo, si el dominio es "google.com", la organización podría ser "Google LLC".
    *   Resultado: \`true\` si hay una coincidencia clara, sino \`false\`.

6.  **Estado General (overallStatus)**:
    *   Si **TODAS** las validaciones anteriores son \`true\`, el estado es \`verified\` ✅.
    *   Si el registro BIMI no se encuentra o está vacío, el estado es \`not-found\` 🧐.
    *   En cualquier otro caso (si alguna validación falla), el estado es \`unverified\` ❌.

7.  **Análisis (analysis)**:
    *   Redacta un informe detallado explicando el resultado de cada paso. Si algo falla, explica por qué y cómo solucionarlo. Sé directo, claro y usa emojis para cada punto.

**Datos a Analizar:**
- Dominio: ${domain}
- Selector: ${selector}
- Registro DMARC: ${dmarcRecords.join('\\n') || 'No encontrado'}
- Registro BIMI: ${bimiRecord || 'No encontrado'}
- Contenido SVG (primeros 500 caracteres): ${svgContent.substring(0, 500) || 'No encontrado o no se pudo descargar'}
- Contenido PEM (primeros 500 caracteres): ${pemContent.substring(0, 500) || 'No encontrado o no se pudo descargar'}
`;
  
  try {
    const rawResponse = await deepseekChat(prompt, {
      apiKey: aiConfig.apiKey,
      model: aiConfig.modelName,
    });
    
    const jsonMatch = rawResponse.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch || !jsonMatch[1]) {
      throw new Error("La IA no devolvió un JSON válido.");
    }
    
    const parsedJson = JSON.parse(jsonMatch[1]);
    const validatedOutput = VmcVerificationOutputSchema.parse(parsedJson);

    return validatedOutput;
  } catch (error: any) {
    console.error('Error in VMC authenticity check with Deepseek:', error);
    throw new Error(`Error al analizar la autenticidad del VMC: ${error.message}`);
  }
}
