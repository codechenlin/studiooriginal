
'use server';

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { testChat } from '@/ai/flows/test-chat-flow';

const configPath = path.join(process.cwd(), 'src', 'app', 'lib', 'ai-config.json');
const promptsPath = path.join(process.cwd(), 'src', 'app', 'lib', 'prompts.json');

const AiConfigSchema = z.object({
  provider: z.literal('deepseek'),
  apiKey: z.string(),
  modelName: z.string(),
  enabled: z.boolean(),
  functions: z.object({
    dnsAnalysis: z.boolean(),
    vmcVerification: z.boolean(),
  }),
});

const PromptsSchema = z.object({
  vmcAnalysis: z.string(),
});

export type AiConfig = z.infer<typeof AiConfigSchema>;
export type PromptsConfig = z.infer<typeof PromptsSchema>;

async function readConfigFile<T>(filePath: string, schema: z.ZodSchema<T>, defaultConfig: T): Promise<T> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return schema.parse(JSON.parse(fileContent));
  } catch (error) {
    console.warn(`Failed to read or parse ${path.basename(filePath)}, returning default. Error:`, error);
    return defaultConfig;
  }
}

async function writeConfigFile<T>(filePath: string, schema: z.ZodSchema<T>, config: T) {
  try {
    const validatedConfig = schema.parse(config);
    await fs.writeFile(filePath, JSON.stringify(validatedConfig, null, 2), 'utf-8');
  } catch (error: any) {
    console.error(`Failed to write to ${path.basename(filePath)}:`, error);
    throw new Error(`No se pudo guardar el archivo de configuración.`);
  }
}

// AI Config Actions
export async function getAiConfig(): Promise<{ success: boolean, data?: AiConfig, error?: string }> {
  try {
    const config = await readConfigFile(configPath, AiConfigSchema, {
      provider: 'deepseek',
      apiKey: '',
      modelName: 'deepseek-chat',
      enabled: false,
      functions: {
        dnsAnalysis: false,
        vmcVerification: false,
      },
    });
    return { success: true, data: config };
  } catch (error: any) {
    return { success: false, error: 'No se pudo leer la configuración de IA.' };
  }
}

export async function saveAiConfig(config: AiConfig): Promise<{ success: boolean, error?: string }> {
  try {
    await writeConfigFile(configPath, AiConfigSchema, config);
    revalidatePath('/d92y02b11u/dashboard/ai-config', 'page');
    revalidatePath('/dashboard/servers', 'page');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Prompts Actions
export async function getPrompts(): Promise<{ success: boolean, data?: PromptsConfig, error?: string }> {
  try {
    const prompts = await readConfigFile(promptsPath, PromptsSchema, {
      vmcAnalysis: 'Prompt por defecto para VMC si el archivo no existe.',
    });
    return { success: true, data: prompts };
  } catch (error: any) {
    return { success: false, error: 'No se pudo leer el archivo de prompts.' };
  }
}

export async function savePrompts(prompts: PromptsConfig): Promise<{ success: boolean, error?: string }> {
  try {
    await writeConfigFile(promptsPath, PromptsSchema, prompts);
    revalidatePath('/d92y02b11u/dashboard/ai-config', 'page');
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
