
'use server';

import { checkApiHealth, type ApiHealthOutput } from '@/ai/flows/api-health-check-flow';
import { validateAndAnalyzeDomain } from '@/ai/flows/vmc-deepseek-analysis-flow';
import { z } from 'zod';

// Input schema for our main flow
export const VmcAnalysisInputSchema = z.object({
  domain: z.string().describe('The domain to validate and analyze.'),
});
export type VmcAnalysisInput = z.infer<typeof VmcAnalysisInputSchema>;


// Output schema for the AI's analysis
export const VmcAnalysisOutputSchema = z.object({
    bimi_is_valid: z.boolean().describe("Determina si el registro BIMI es válido. Debe tener 'exists: true' y 'dmarc_enforced: true' para ser válido."),
    bimi_description: z.string().describe("Descripción corta de por qué el registro BIMI se considera válido o falso."),
    svg_is_valid: z.boolean().describe("Determina si la imagen SVG es válida y segura. Debe tener 'compliant: true'."),
    svg_description: z.string().describe("Descripción corta de por qué el SVG es correcto o falso."),
    vmc_is_authentic: z.boolean().describe("Determina si el certificado VMC es auténtico. Debe tener 'authentic: true', 'chain_ok: true' y 'revocation_ok: true'."),
    vmc_description: z.string().describe("Descripción corta de por qué el VMC es auténtico o falso.")
});
export type VmcAnalysisOutput = z.infer<typeof VmcAnalysisOutputSchema>;


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

export async function validateDomainWithAI(input: VmcAnalysisInput): Promise<{ success: boolean; data?: VmcAnalysisOutput; error?: string }> {
  try {
    const result = await validateAndAnalyzeDomain(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('VMC validation with AI action error:', error);
    return { success: false, error: error.message };
  }
}
