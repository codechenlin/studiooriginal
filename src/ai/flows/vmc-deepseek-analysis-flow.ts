
'use server';
/**
 * @fileOverview A flow to validate a domain's BIMI/VMC records and then use an AI to analyze the results.
 * 
 * - validateAndAnalyzeDomain: Fetches validation data from an external API and sends it to DeepSeek for analysis.
 */

import { deepseekChat } from '@/ai/deepseek';
import { getAiConfigForFlows } from '@/ai/genkit';
import { type VmcAnalysisInput, type VmcAnalysisOutput, VmcAnalysisOutputSchema } from '@/app/dashboard/demo/types';
import fs from 'fs/promises';
import path from 'path';
import dns from 'node:dns/promises';

const promptsPath = path.join(process.cwd(), 'src', 'app', 'lib', 'prompts.json');

const EXTERNAL_API_BASE = "https://8b3i4m6i39303g2k432u.fanton.cloud";
const EXTERNAL_API_KEY = "gd6408fgbn20lpicvm67d0mvfal0anvq83zmj89";

async function getMxRecords(domain: string): Promise<dns.MxRecord[] | null> {
    try {
        return await dns.resolveMx(domain);
    } catch (error: any) {
        if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
            return null; // No records found is not an error for us.
        }
        console.error(`Error fetching MX records for ${domain}:`, error);
        return null; // Treat other errors as "no records found" for simplicity.
    }
}


/**
 * Fetches validation data from the external API.
 * @param domain The domain to validate.
 * @returns The full JSON response from the external API or an error object.
 */
async function fetchBimiAndVmcValidation(domain: string): Promise<{ success: boolean; data: any }> {
  const url = `${EXTERNAL_API_BASE}/validate`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          domain: domain,
          api_key: EXTERNAL_API_KEY,
      })
    });

    if (!response.ok) {
      let errorBody = 'No se pudo leer el cuerpo del error.';
      try {
        errorBody = await response.text();
      } catch (textError) {
        // Ignore error, use default message
      }
      const errorMessage = `La API externa devolvió un error: ${response.status} ${response.statusText}. Cuerpo: ${errorBody}`;
      return { success: false, data: { error: errorMessage, rawBody: errorBody } };
    }

    const responseData = await response.json();
    return { success: true, data: responseData.result || responseData };
  } catch (error: any) {
    console.error('Fallo al conectar con la API externa:', error);
    const errorMessage = `No se pudo conectar con la API de validación: ${error.message}`;
    return { success: false, data: { error: errorMessage } };
  }
}

async function getVmcAnalysisPrompt(): Promise<string> {
    try {
        const fileContent = await fs.readFile(promptsPath, 'utf-8');
        const prompts = JSON.parse(fileContent);
        return prompts.vmcAnalysis;
    } catch (error) {
        console.error("Error reading VMC analysis prompt, using fallback.", error);
        return "Eres un validador técnico de autenticidad BIMI/VMC. Analiza el JSON y da un veredicto."; // Fallback prompt
    }
}

/**
 * Main flow that validates a domain and then sends the result to an AI for analysis.
 * @param input The domain to be processed.
 * @returns An analysis object from the AI.
 */
export async function validateAndAnalyzeDomain(input: VmcAnalysisInput): Promise<VmcAnalysisOutput> {
  const aiConfig = getAiConfigForFlows();

  if (!aiConfig?.enabled || !aiConfig.functions?.vmcVerification) {
    throw new Error('El análisis VMC con IA está deshabilitado por el administrador.');
  }

  if (aiConfig.provider !== 'deepseek' || !aiConfig.apiKey) {
      throw new Error('La IA de Deepseek no está configurada o habilitada.');
  }

  // 1. Fetch data from both sources concurrently
  const [bimiVmcResponse, mxRecords] = await Promise.all([
    fetchBimiAndVmcValidation(input.domain),
    getMxRecords(input.domain),
  ]);
  
  // 2. Prepare the data to be sent to the AI
  const dataToAnalyze: any = {
      bimi_vmc_validation: bimiVmcResponse.data
  };

  // Augment MX data for the AI if records were found
  if (mxRecords && mxRecords.length > 0) {
      const daybuuMxRecord = mxRecords.find((record: any) => typeof record.exchange === 'string' && record.exchange.includes('daybuu.com'));
      dataToAnalyze.mx_records = {
          records: mxRecords,
          points_to_daybuu: !!daybuuMxRecord,
          priority_is_zero: daybuuMxRecord ? daybuuMxRecord.priority === 0 : false,
      };
  } else {
       dataToAnalyze.mx_records = { records: [], points_to_daybuu: false, priority_is_zero: false };
  }


  // 3. Get the main prompt and construct the final prompt for the AI
  const vmcPromptTemplate = await getVmcAnalysisPrompt();
  const prompt = `${vmcPromptTemplate}\n\n**Datos a analizar:**\n\`\`\`json\n${JSON.stringify(dataToAnalyze, null, 2)}\n\`\`\``;
  
  try {
    // 4. Call the AI with the constructed prompt
    const rawResponse = await deepseekChat(prompt, {
      apiKey: aiConfig.apiKey,
      model: aiConfig.modelName || "deepseek-coder",
    });
    
    // 5. Extract the analysis text and the JSON block from the AI's response
    let jsonString = '';
    const jsonBlockMatch = rawResponse.match(/<<<JSON_START>>>([\s\S]*?)<<<JSON_END>>>/);
    
    if (jsonBlockMatch && jsonBlockMatch[1]) {
        jsonString = jsonBlockMatch[1];
    } else {
        const firstBrace = rawResponse.indexOf('{');
        const lastBrace = rawResponse.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace) {
            jsonString = rawResponse.substring(firstBrace, lastBrace + 1);
        }
    }
    
    if (!jsonString) {
        throw new Error("La IA no devolvió un objeto JSON válido en su respuesta.");
    }
    
    // Extract the text part before the JSON block
    const analysisTextMatch = rawResponse.match(/(.*?)(?:<<<JSON_START>>>|```json)/s);
    const analysisText = analysisTextMatch ? analysisTextMatch[1].trim() : 'Análisis no proporcionado.';

    // 6. Parse and validate the JSON output
    try {
        const parsedJson = JSON.parse(jsonString);
        const validatedOutput = VmcAnalysisOutputSchema.parse(parsedJson);
        
        // 7. Combine the analysis text with the validated JSON data
        return {
            ...validatedOutput,
            detailed_analysis: analysisText
        };
    } catch (parseError) {
        console.error("Failed to parse JSON from AI response:", parseError, "\nExtracted JSON string:", jsonString);
        throw new Error("La IA no devolvió un objeto JSON válido en su respuesta.");
    }

  } catch (error: any) {
    console.error('Error durante el análisis con Deepseek:', error);
    throw new Error(`Error al analizar los datos con la IA: ${error.message}`);
  }
}
