
'use server';

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { testChat } from '@/ai/flows/test-chat-flow';

const configPath = path.join(process.cwd(), 'src', 'app', 'lib', 'ai-config.json');

const AiConfigSchema = z.object({
  provider: z.literal('deepseek'),
  apiKey: z.string(),
  modelName: z.string(),
  enabled: z.boolean(),
  functions: z.object({
    dnsAnalysis: z.boolean(),
  }),
});

export type AiConfig = z.infer<typeof AiConfigSchema>;

async function readAiConfig(): Promise<AiConfig> {
  try {
    const fileContent = await fs.readFile(configPath, 'utf-8');
    return AiConfigSchema.parse(JSON.parse(fileContent));
  } catch (error) {
    // If file doesn't exist or is invalid, return a default config
    return {
      provider: 'deepseek',
      apiKey: '',
      modelName: 'deepseek-chat',
      enabled: false,
      functions: {
        dnsAnalysis: false,
      },
    };
  }
}

async function writeAiConfig(config: AiConfig) {
  try {
    const validatedConfig = AiConfigSchema.parse(config);
    await fs.writeFile(configPath, JSON.stringify(validatedConfig, null, 2), 'utf-8');
  } catch (error: any) {
    console.error("Failed to write to ai-config.json:", error);
    throw new Error('No se pudo guardar el archivo de configuración de IA.');
  }
}

export async function getAiConfig(): Promise<{ success: boolean, data?: AiConfig, error?: string }> {
  try {
    const config = await readAiConfig();
    return { success: true, data: config };
  } catch (error: any) {
    return { success: false, error: 'No se pudo leer la configuración de IA.' };
  }
}

export async function saveAiConfig(config: AiConfig): Promise<{ success: boolean, error?: string }> {
  try {
    await writeAiConfig(config);
    revalidatePath('/d92y02b11u/dashboard/ai-config', 'page');
    // Revalidate other paths that might use AI config
    revalidatePath('/dashboard/servers', 'page');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

const testConnectionSchema = z.object({
    provider: z.string(),
    apiKey: z.string(),
    modelName: z.string(),
});

export async function testAiConnection(input: z.infer<typeof testConnectionSchema>): Promise<{ success: boolean; error?: string }> {
    try {
        const { apiKey, modelName } = testConnectionSchema.parse(input);
        
        // Directly call the test function with the provided credentials
        const response = await testChat("Hola, ¿puedes confirmar que estás funcionando?", {
            apiKey: apiKey,
            model: modelName,
        });
        
        if (response && typeof response === 'string' && response.length > 0) {
            return { success: true };
        } else {
            return { success: false, error: 'La IA respondió con un formato inesperado.' };
        }
    } catch (error: any) {
        console.error("AI connection test error:", error);
        return { success: false, error: `Error de conexión con la IA: ${error.message}` };
    }
}
