
'use server';
/**
 * @fileOverview A flow to validate a domain's BIMI/VMC records and then use an AI to analyze the results.
 * 
 * - validateAndAnalyzeDomain: Fetches validation data from an external API and sends it to DeepSeek for analysis.
 */

import { z } from 'genkit';
import { deepseekChat } from '@/ai/deepseek';
import { getAiConfigForFlows } from '@/ai/genkit';
import { type VmcAnalysisInput, VmcAnalysisOutputSchema } from '@/app/dashboard/demo/actions';


const EXTERNAL_API_BASE = "https://8b3i4m6i39303g2k432u.fanton.cloud:9090";
const EXTERNAL_API_KEY = "6783434hfsnjd7942074nofsbs6472930nfns629df0983jvnmkd32";

/**
 * Fetches validation data from the external API.
 * @param domain The domain to validate.
 * @returns The full JSON response from the external API.
 */
async function fetchDomainValidation(domain: string): Promise<any> {
  const url = `${EXTERNAL_API_BASE}/validate?domain=${encodeURIComponent(domain)}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': EXTERNAL_API_KEY,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'No se pudo leer el cuerpo del error.');
      throw new Error(`La API externa devolvió un error: ${response.status} ${response.statusText}. Cuerpo: ${errorBody}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Fallo al conectar con la API externa:', error);
    throw new Error(`No se pudo conectar con la API de validación: ${error.message}`);
  }
}

/**
 * Main flow that validates a domain and then sends the result to an AI for analysis.
 * @param input The domain to be processed.
 * @returns An analysis object from the AI.
 */
export async function validateAndAnalyzeDomain(input: VmcAnalysisInput) {
  const aiConfig = getAiConfigForFlows();

  if (!aiConfig?.enabled || !aiConfig.functions?.vmcVerification) {
    throw new Error('El análisis VMC con IA está deshabilitado por el administrador.');
  }

  if (aiConfig.provider !== 'deepseek' || !aiConfig.apiKey) {
      throw new Error('La IA de Deepseek no está configurada o habilitada.');
  }

  // 1. Fetch data from the external API
  const validationData = await fetchDomainValidation(input.domain);

  // 2. Prepare and send data to DeepSeek AI
  const prompt = `
    Eres un experto en seguridad de correo electrónico y autenticación de marca. Analiza el siguiente objeto JSON, que contiene los resultados de una validación de BIMI, SVG y VMC para el dominio '${input.domain}'. Tu tarea es determinar la validez de cada componente y proporcionar una justificación clara y concisa.
    El JSON de entrada puede contener dos ramas principales de datos: 'python_method' y 'openssl_method'. Debes considerar la información de ambas para formar tu veredicto.

    Tu respuesta DEBE ser un objeto JSON válido que cumpla con este esquema Zod:
    \`\`\`json
    {
        "type": "object",
        "properties": {
            "bimi_is_valid": { "type": "boolean" },
            "bimi_description": { "type": "string" },
            "svg_is_valid": { "type": "boolean" },
            "svg_description": { "type": "string" },
            "vmc_is_authentic": { "type": "boolean" },
            "vmc_description": { "type": "string" }
        },
        "required": ["bimi_is_valid", "bimi_description", "svg_is_valid", "svg_description", "vmc_is_authentic", "vmc_description"]
    }
    \`\`\`

    **Datos a analizar:**
    \`\`\`json
    ${JSON.stringify(validationData, null, 2)}
    \`\`\`

    **Reglas de Análisis:**

    1.  **Registro BIMI (bimi_is_valid):**
        *   **VÁLIDO (true):** Solo si el registro BIMI existe Y la sintaxis es correcta (tiene 'v=BIMI1' y 'l=') Y la política DMARC está en modo 'reject' o 'quarantine'.
        *   **FALSO (false):** En cualquier otro caso.
        *   **Descripción (bimi_description):** Si es falso, explica por qué (ej. "No existe el registro BIMI.", "La sintaxis es incorrecta", o "DMARC no está en modo seguro."). Si es válido, di "El registro BIMI está presente y la política DMARC es segura.". Si el registro no existe, menciónalo claramente.

    2.  **Imagen SVG (svg_is_valid):**
        *   **VÁLIDO (true):** Solo si el SVG existe Y es compatible con las reglas BIMI-safe.
        *   **FALSO (false):** Si no existe o no es compatible.
        *   **Descripción (svg_description):** Si es falso, explica por qué (ej. "El archivo SVG no se encontró." o "El SVG no cumple con las reglas de seguridad BIMI."). Si es válido, di "El logo SVG es compatible con BIMI.".

    3.  **Certificado VMC (vmc_is_authentic):**
        *   **AUTÉNTICO (true):** Solo si el certificado VMC existe, es auténtico, la cadena de confianza está completa Y el estado de revocación es "bueno" (revocation_ok = true).
        *   **FALSO (false):** En cualquier otro caso.
        *   **Descripción (vmc_description):** Si es falso, explica la razón principal (ej. "No se encontró un certificado VMC.", "La cadena de confianza del certificado está rota.", "El certificado ha sido revocado."). Si es auténtico, di "El certificado VMC es auténtico y fue verificado por una autoridad oficial.". Si no se encuentra un VMC, la descripción debe indicarlo.

    **Instrucciones Adicionales:**
    - Sé directo y conciso.
    - Tu respuesta final DEBE ser únicamente el objeto JSON solicitado.
  `;
  
  try {
    const rawResponse = await deepseekChat(prompt, {
      apiKey: aiConfig.apiKey,
      model: aiConfig.modelName,
    });
    
    // Extract JSON from the response
    const jsonMatch = rawResponse.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch || !jsonMatch[1]) {
      throw new Error("La IA no devolvió un objeto JSON válido en su respuesta.");
    }
    
    const parsedJson = JSON.parse(jsonMatch[1]);
    const validatedOutput = VmcAnalysisOutputSchema.parse(parsedJson);

    return validatedOutput;
  } catch (error: any) {
    console.error('Error durante el análisis con Deepseek:', error);
    throw new Error(`Error al analizar los datos con la IA: ${error.message}`);
  }
}
