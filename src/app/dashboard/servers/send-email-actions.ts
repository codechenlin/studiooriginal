
'use server';

import { 
    sendTestEmail, 
    type SendTestEmailInput 
} from '@/ai/flows/send-test-email-flow';
import { z } from 'zod';

const SendTestEmailInputSchema = z.object({
  host: z.string(),
  port: z.number(),
  secure: z.boolean(),
  auth: z.object({
    user: z.string(),
    pass: z.string(),
  }),
  from: z.string(),
  to: z.string(),
});


export async function sendTestEmailAction(input: SendTestEmailInput) {
  try {
    const validatedInput = SendTestEmailInputSchema.parse(input);
    const result = await sendTestEmail(validatedInput);
    return result;
  } catch (error) {
    console.error('Send test email action error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}

    