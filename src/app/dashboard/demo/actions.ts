
'use server';

import { checkSpam, type SpamCheckerInput } from '@/ai/flows/spam-checker-flow';
import { scanFileForVirus } from '@/ai/flows/virus-scan-flow';
import { type VirusScanOutput, VirusScanInputSchema } from '@/ai/flows/virus-scan-types';
import { z } from 'zod';
import { checkApiHealth } from '@/ai/flows/api-health-check-flow';

const SpamCheckerInputSchema = z.object({
  text: z.string().describe('The text content to be analyzed for spam.'),
  threshold: z.number().min(1).max(10).optional().default(5.0).describe('The spam score threshold. Default is 5.0.'),
});

/**
 * Server action to run the spam check flow.
 */
export async function checkSpamAction(input: SpamCheckerInput) {
  try {
    const validatedInput = SpamCheckerInputSchema.parse(input);
    const result = await checkSpam(validatedInput);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Spam check action error:', error);
    return { success: false, error: error.message };
  }
}

export async function scanFileForVirusAction(formData: FormData): Promise<{ success: boolean; data?: VirusScanOutput, error?: string; }> {
  const file = formData.get('file') as File;
  if (!file) {
    return { success: false, error: 'No file provided.' };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    
    const result = await scanFileForVirus({
      fileName: file.name,
      fileBuffer: fileBuffer,
    });
    
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Virus scan action error:', error);
    return { success: false, error: `Error al escanear con ClamAV: ${error.message}` };
  }
}

export async function checkApiHealthAction() {
  try {
    const result = await checkApiHealth();
    if (result.status === 'ok') {
        return { success: true, data: result };
    }
    return { success: false, error: `API returned status: ${result.status}` };
  } catch (error: any) {
    console.error('API health check action error:', error);
    return { success: false, error: error.message };
  }
}
