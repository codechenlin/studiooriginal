/**
 * @fileOverview Type definitions for the virus scan flow.
 */
import { z } from 'genkit';

export const VirusScanInputSchema = z.object({
  fileName: z.string().describe('The name of the file to scan.'),
  fileBuffer: z.instanceof(Buffer).describe('The file content as a Buffer.'),
});
export type VirusScanInput = z.infer<typeof VirusScanInputSchema>;

export const VirusScanOutputSchema = z.object({
  isInfected: z.boolean().describe('Whether a virus was detected or not.'),
  message: z.string().describe('A summary of the scan result.'),
});
export type VirusScanOutput = z.infer<typeof VirusScanOutputSchema>;
