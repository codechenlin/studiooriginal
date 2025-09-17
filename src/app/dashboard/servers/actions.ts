
'use server';

import {
  verifyDnsHealth,
  type DnsHealthInput,
} from '@/ai/flows/dns-verification-flow';
import { z } from 'zod';

const actionSchema = z.object({
  domain: z.string().describe('El nombre de dominio a verificar.'),
  dkimPublicKey: z.string().describe('La clave pública DKIM esperada para el selector "foxmiu".'),
});


export async function verifyDnsAction(input: DnsHealthInput) {
  try {
    const validatedInput = actionSchema.parse(input);
    const result = await verifyDnsHealth(validatedInput);
    return { success: true, data: result };
  } catch (error) {
    console.error('DNS verification action error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}
