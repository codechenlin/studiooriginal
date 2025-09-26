
'use server';

import { checkSpam, SpamCheckerInputSchema, type SpamCheckerInput } from '@/ai/flows/spam-checker-flow';
import { scanFileForViruses, type VirusScanInput } from '@/ai/flows/virus-scan-flow';
import { z } from 'zod';

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

const VirusScanInputSchema = z.object({
  fileName: z.string(),
  fileDataUri: z.string(),
});

/**
 * Server action to run the virus scan flow.
 */
export async function scanFileAction(input: VirusScanInput) {
  try {
    const validatedInput = VirusScanInputSchema.parse(input);
    const result = await scanFileForViruses(validatedInput);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('Virus scan action error:', error);
    return { success: false, error: error.message };
  }
}
