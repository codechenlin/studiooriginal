
'use server';
/**
 * @fileOverview An AI agent to analyze and diagnose SMTP connection errors.
 *
 * - analyzeSmtpError - A function that uses AI to analyze SMTP errors.
 * - SmtpErrorAnalysisInput - The input type for the analyzeSmtpError function.
 * - SmtpErrorAnalysisOutput - The return type for the analyzeSmtpError function.
 */

import { getAiConfigForFlows } from '@/ai/genkit';
import { z } from 'zod';
import { deepseekChat } from '@/ai/deepseek';


export type SmtpErrorAnalysisInput = z.infer<typeof SmtpErrorAnalysisInputSchema>;
const SmtpErrorAnalysisInputSchema = z.object({
  error: z.string().describe('The SMTP error message returned by the server.'),
});

export type SmtpErrorAnalysisOutput = z.infer<typeof SmtpErrorAnalysisOutputSchema>;
const SmtpErrorAnalysisOutputSchema = z.object({
  analysis: z.string().describe('A natural language analysis of the SMTP error, explaining the likely cause and providing clear, actionable steps for the user to resolve it. Be concise, direct, and use emojis. Respond in Spanish.'),
});

export async function analyzeSmtpError(
  input: SmtpErrorAnalysisInput
): Promise<SmtpErrorAnalysisOutput | null> {
  const aiConfig = getAiConfigForFlows();

  if (!aiConfig?.enabled || !aiConfig.functions?.dnsAnalysis) {
    throw new Error('SMTP error analysis with AI is disabled by the administrator.');
  }

  if (aiConfig.provider !== 'deepseek' || !aiConfig.apiKey) {
      throw new Error('Deepseek AI is not configured or enabled.');
  }
  
  const { error } = input;

  const prompt = `Eres un experto en administración de servidores de correo. Analiza el siguiente error de conexión SMTP y proporciona un diagnóstico claro y pasos para solucionarlo. Responde en español y usa emojis. Tu respuesta DEBE ser un objeto JSON válido que cumpla con este esquema Zod:
\`\`\`json
{
  "type": "object",
  "properties": {
    "analysis": { "type": "string" }
  },
  "required": ["analysis"]
}
\`\`\`

Error SMTP: ${error}

Reglas de Análisis:
- Si el error contiene "EAUTH" o "Authentication failed", el problema es de usuario/contraseña. ✅
- Si el error contiene "ECONNREFUSED" o "Connection refused", el problema es de host, puerto o firewall. 🖥️
- Si el error contiene "wrong version number" o "TLS", es un problema de configuración SSL/TLS. 🛡️
- Si el error contiene "Timeout", es un problema de red o el servidor no responde. ⏳

Proporciona una explicación del problema y una lista de pasos numerados que el usuario debe seguir.
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
    const validatedOutput = SmtpErrorAnalysisOutputSchema.parse(parsedJson);

    return validatedOutput;
  } catch (error: any) {
    console.error('Error in SMTP error analysis with Deepseek:', error);
    throw new Error(`Error al analizar el error SMTP: ${error.message}`);
  }
}
