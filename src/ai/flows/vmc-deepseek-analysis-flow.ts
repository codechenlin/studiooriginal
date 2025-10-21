
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

const promptsPath = path.join(process.cwd(), 'src', 'app', 'lib', 'prompts.json');

const EXTERNAL_API_BASE = "http://8b3i4m6i39303g2k432u.fanton.cloud:9090";
const EXTERNAL_API_KEY = "6783434hfsnjd7942074nofsbs6472930nfns629df0983jvnmkd32";

/**
 * Fetches validation data from the external API.
 * @param domain The domain to validate.
 * @returns The full JSON response from the external API.
 */
async function fetchDomainValidation(domain: string): Promise<any> {
  const url = `${EXTERNAL_API_BASE}/validate/raw?domain=${encodeURIComponent(domain)}`;
  
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

  // 1. Fetch data from the external API
  const validationData = await fetchDomainValidation(input.domain);
  
  // 2. Get the prompt from the config file
  const vmcPrompt = await getVmcAnalysisPrompt();

  // 3. Prepare and send data to DeepSeek AI
  const prompt = `${vmcPrompt}\n\n**Datos a analizar:**\n\`\`\`json\n${JSON.stringify(validationData, null, 2)}\n\`\`\``;
  
  try {
    const rawResponse = await deepseekChat(prompt, {
      apiKey: aiConfig.apiKey,
      model: "deepseek-coder",
    });
    
    // Improved JSON extraction logic
    let jsonString = '';
    const jsonBlockMatch = rawResponse.match(/```json\n([\s\S]*?)\n```/);
    
    if (jsonBlockMatch && jsonBlockMatch[1]) {
        jsonString = jsonBlockMatch[1];
    } else {
        // Fallback: Find the first '{' and the last '}'
        const firstBrace = rawResponse.indexOf('{');
        const lastBrace = rawResponse.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace > firstBrace) {
            jsonString = rawResponse.substring(firstBrace, lastBrace + 1);
        }
    }
    
    if (!jsonString) {
        throw new Error("La IA no devolvió un objeto JSON válido en su respuesta.");
    }
    
    const analysisTextMatch = rawResponse.match(/(.*?)(?:<<<JSON_START>>>|```json)/s);
    const analysisText = analysisTextMatch ? analysisTextMatch[1].trim() : 'Análisis no proporcionado.';

    try {
        const parsedJson = JSON.parse(jsonString);
        const validatedOutput = VmcAnalysisOutputSchema.parse(parsedJson);
        
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
