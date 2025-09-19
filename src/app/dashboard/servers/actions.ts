
'use server';

import {
  verifyDnsHealth,
  type DnsHealthInput,
} from '@/ai/flows/dns-verification-flow';
import {
  verifyOptionalDnsHealth,
  type OptionalDnsHealthInput,
} from '@/ai/flows/optional-dns-verification-flow';

import { z } from 'zod';
import dns from 'node:dns/promises';

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

const optionalDnsActionSchema = z.object({
  domain: z.string().describe('El nombre de dominio a verificar.'),
});

export async function verifyOptionalDnsAction(input: OptionalDnsHealthInput) {
  try {
    const validatedInput = optionalDnsActionSchema.parse(input);
    const result = await verifyOptionalDnsHealth(validatedInput);
    return { success: true, data: result };
  } catch (error) {
    console.error('Optional DNS verification action error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}


const verifyDomainOwnershipSchema = z.object({
  domain: z.string(),
  expectedValue: z.string(),
  recordType: z.enum(['TXT', 'MX', 'CNAME', 'SPF', 'DMARC', 'BIMI', 'VMC']),
  name: z.string(),
});

export async function verifyDomainOwnershipAction(input: z.infer<typeof verifyDomainOwnershipSchema>) {
  try {
    const { domain, expectedValue, recordType, name } = verifyDomainOwnershipSchema.parse(input);
    const fullName = name === '@' ? domain : `${name}.${domain}`;
    
    if (recordType === 'MX') {
        const records = await dns.resolveMx(domain);
        const isVerified = records.some(record => record.exchange.includes(expectedValue));
        return { success: isVerified, error: isVerified ? undefined : 'No se pudo encontrar el registro MX esperado.' };
    }

    const records = await dns.resolveTxt(fullName);
    const flatRecords = records.map(r => r.join(''));

    let isVerified = false;
    if (recordType === 'VMC') {
        isVerified = flatRecords.some(r => r.includes("v=BIMI1;") && r.includes("a="));
    } else if (recordType === 'BIMI') {
        isVerified = flatRecords.some(r => r.includes("v=BIMI1;"));
    } else {
        isVerified = flatRecords.some(r => r.includes(expectedValue));
    }
    
    if (isVerified) {
      return { success: true };
    } else {
      return { success: false, error: `No se pudo encontrar el registro ${recordType} de verificación. Asegúrate de que se haya propagado correctamente.` };
    }
  } catch (error: any) {
    if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
      return { success: false, error: `No se encontraron registros TXT para ${name === '@' ? domain : `${name}.${domain}`}.` };
    }
    console.error('Domain ownership verification error:', error);
    return { success: false, error: 'Ocurrió un error inesperado al verificar el dominio.' };
  }
}

    