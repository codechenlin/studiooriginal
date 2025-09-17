
'use server';

import {
  verifyDns,
  type DnsVerificationInput,
} from '@/ai/flows/dns-verification-flow';
import { z } from 'zod';

const actionSchema = z.object({
  domain: z.string(),
  recordType: z.enum(['TXT', 'MX', 'CNAME', 'SPF', 'DMARC']),
  name: z.string(),
  expectedValue: z.string().optional(),
});


export async function verifyDnsAction(input: DnsVerificationInput) {
  try {
    const validatedInput = actionSchema.parse(input);
    const result = await verifyDns(validatedInput);
    if (result.isVerified) {
      return { success: true, data: result.foundRecords };
    } else {
      return { success: false, error: result.reason, data: result.foundRecords };
    }
  } catch (error) {
    console.error('DNS verification action error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}
