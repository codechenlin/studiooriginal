/**
 * @fileOverview Type definitions for the SpamAssassin API interaction.
 */
import { z } from 'genkit';

export const SpamAssassinInputSchema = z.object({
  from: z.string().describe('La dirección de correo del remitente.'),
  to: z.string().describe('La dirección de correo del destinatario.'),
  subject: z.string().describe('El asunto del correo.'),
  body: z.string().describe('El cuerpo del correo electrónico.'),
  sensitivity: z.number().min(0.1).max(20.0).optional().default(5.0).describe('El umbral de sensibilidad de spam. Por defecto es 5.0.'),
  clamav_scan: z.boolean().optional().default(false),
});
export type SpamAssassinInput = z.infer<typeof SpamAssassinInputSchema>;

export const SpamAssassinOutputSchema = z.object({
  is_spam: z.boolean(),
  score: z.number(),
  threshold: z.number(),
  report: z.string(),
});
export type SpamAssassinOutput = z.infer<typeof SpamAssassinOutputSchema>;
