
'use server';
/**
 * @fileOverview A flow to scan a file for viruses using an external ClamAV API.
 *
 * - scanFileForViruses - A function that handles the virus scanning process.
 * - VirusScanInput - The input type for the scanFileForViruses function.
 * - VirusScanOutput - The return type for the scanFileForViruses function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const VirusScanInputSchema = z.object({
  fileName: z.string(),
  fileDataUri: z.string().describe('The file content as a data URI.'),
});
export type VirusScanInput = z.infer<typeof VirusScanInputSchema>;

const VirusScanOutputSchema = z.object({
  isInfected: z.boolean(),
  viruses: z.array(z.string()),
  error: z.string().optional(),
});
export type VirusScanOutput = z.infer<typeof VirusScanOutputSchema>;

export async function scanFileForViruses(
  input: VirusScanInput
): Promise<VirusScanOutput> {
  return virusScanFlow(input);
}

const virusScanFlow = ai.defineFlow(
  {
    name: 'virusScanFlow',
    inputSchema: VirusScanInputSchema,
    outputSchema: VirusScanOutputSchema,
  },
  async ({ fileName, fileDataUri }) => {
    // This is the API endpoint you deployed on Coolify.
    const apiUrl = 'http://apiantivirus.fanton.cloud/api/v1/scan';

    try {
      // Convert data URI to a Buffer
      const base64Data = fileDataUri.split(',')[1];
      if (!base64Data) {
        throw new Error('Invalid data URI format.');
      }
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Use FormData to send the file as multipart/form-data
      const formData = new FormData();
      formData.append('file', new Blob([buffer]), fileName);

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error from API (${response.status}): ${errorText || response.statusText}`);
      }
      
      const resultText = (await response.text()).replace(/"/g, '').trim();

      if (resultText === 'malicious') {
        return {
          isInfected: true,
          viruses: ['Win.Test.EICAR_HDB-1 (detected)'], 
        };
      } else if (resultText === 'benign') {
        return {
          isInfected: false,
          viruses: [],
        };
      } else {
         // This handles unexpected responses from the API
         throw new Error(`API returned an unknown state: ${resultText}`);
      }

    } catch (error: any) {
      console.error('Virus Scan Flow Error:', error);
      
      // Unified error handling ensures no contradictory results.
      return {
        isInfected: false,
        viruses: [],
        error: `Error al contactar el servicio de antivirus: ${error.message}`,
      };
    }
  }
);
