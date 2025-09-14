
'use server';

import {
  verifyDns,
  type DnsVerificationInput,
} from '@/ai/flows/dns-verification-flow';
import { z } from 'zod';

const actionSchema = z.object({
  domain: z.string(),
  expectedTxt: z.string(),
});

export async function verifyDnsAction(input: DnsVerificationInput) {
  try {
    const validatedInput = actionSchema.parse(input);
    const result = await verifyDns(validatedInput);
    if (result.isVerified) {
      return { success: true };
    } else {
      return { success: false, error: result.reason };
    }
  } catch (error) {
    console.error('DNS verification action error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}
