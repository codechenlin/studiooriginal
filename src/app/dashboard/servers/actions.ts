
"use server";

import {
  verifyDnsHealth,
  type DnsHealthInput,
} from '@/ai/flows/dns-verification-flow';
import { 
  validateAndAnalyzeDomain,
  type VmcAnalysisInput,
} from '@/ai/flows/vmc-deepseek-analysis-flow';
import { VmcAnalysisInputSchema, type VmcAnalysisOutput } from '@/app/dashboard/demo/types';


import { z } from 'zod';
import dns from 'node:dns/promises';

const actionSchema = z.object({
  domain: z.string().describe('El nombre de dominio a verificar.'),
  dkimPublicKey: z
    .string()
    .describe('La clave pública DKIM esperada para el selector "daybuu".'),
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

export async function validateDomainWithAIAction(input: VmcAnalysisInput): Promise<{ success: boolean; data?: VmcAnalysisOutput; error?: string }> {
  try {
    const validatedInput = VmcAnalysisInputSchema.parse(input);
    const result = await validateAndAnalyzeDomain(validatedInput);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('VMC validation with AI action error:', error);
    return { success: false, error: error.message };
  }
}

const verifyDomainOwnershipSchema = z.object({
  domain: z.string(),
  expectedValue: z.string(),
  recordType: z.enum(['TXT', 'MX', 'CNAME', 'SPF', 'DMARC', 'BIMI', 'VMC']),
  name: z.string(),
});

export async function verifyDomainOwnershipAction(
  input: z.infer<typeof verifyDomainOwnershipSchema>
) {
  const { domain, expectedValue, recordType, name } =
    verifyDomainOwnershipSchema.parse(input);
  try {
    const fullName = name === '@' ? domain : `${name}.${domain}`;

    if (recordType === 'MX') {
      const records = await dns.resolveMx(domain);
      const isVerified = records.some((record) =>
        record.exchange.includes(expectedValue)
      );
      return {
        success: isVerified,
        error: isVerified
          ? undefined
          : 'No se pudo encontrar el registro MX esperado.',
      };
    }

    const records = await dns.resolveTxt(fullName);
    const flatRecords = records.map((r) => r.join(''));

    let isVerified = false;
    if (recordType === 'VMC') {
      isVerified = flatRecords.some(
        (r) => r.includes('v=BIMI1;') && r.includes('a=')
      );
    } else if (recordType === 'BIMI') {
      isVerified = flatRecords.some((r) => r.includes('v=BIMI1;'));
    } else {
      isVerified = flatRecords.some((r) => r.includes(expectedValue));
    }

    if (isVerified) {
      return { success: true };
    } else {
      return {
        success: false,
        error: `No se pudo encontrar el registro ${recordType} de verificación. Asegúrate de que se haya propagado correctamente.`,
      };
    }
  } catch (error: any) {
    if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
      const fullName = name === '@' ? domain : `${name}.${domain}`;
      return {
        success: false,
        error: `No se encontraron registros TXT para ${fullName}.`,
      };
    }
    console.error('Domain ownership verification error:', error);
    return {
      success: false,
      error: 'Ocurrió un error inesperado al verificar el dominio.',
    };
  }
}
