
import { z } from 'zod';

// Input schema for our main flow
export const VmcAnalysisInputSchema = z.object({
  domain: z.string().describe('The domain to validate and analyze.'),
});
export type VmcAnalysisInput = z.infer<typeof VmcAnalysisInputSchema>;


// Output schema for the AI's analysis
export const VmcAnalysisOutputSchema = z.object({
    bimi_is_valid: z.boolean().describe("Determina si el registro BIMI es válido."),
    bimi_description: z.string().describe("Análisis técnico detallado de por qué el registro BIMI se considera válido o falso."),
    svg_is_valid: z.boolean().describe("Determina si la imagen SVG es válida y segura."),
    svg_description: z.string().describe("Análisis técnico detallado de por qué el SVG es correcto o falso, citando errores específicos si existen."),
    vmc_is_authentic: z.boolean().describe("Determina si el certificado VMC es auténtico."),
    vmc_description: z.string().describe("Análisis técnico detallado de por qué el VMC es auténtico o falso, considerando la cadena de confianza y la revocación.")
});
export type VmcAnalysisOutput = z.infer<typeof VmcAnalysisOutputSchema>;
