
'use server';
/**
 * @fileOverview A flow to scan a file for viruses using a custom ClamAV API.
 *
 * - scanFileForVirus - A function that handles the virus scanning process.
 */

import { ai } from '@/ai/genkit';
import { VirusScanInput, VirusScanInputSchema, VirusScanOutput, VirusScanOutputSchema } from './virus-scan-types';

export async function scanFileForVirus(
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
  async ({ fileName, fileBuffer }) => {
    const apiUrl = 'http://apiantivirus.fanton.cloud/';

    try {
      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: 'application/octet-stream' });
      formData.append('file', blob, fileName);

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorBody;
        try {
            errorBody = await response.json();
        } catch (e) {
            errorBody = { message: await response.text() };
        }
        throw new Error(`Error from API (${response.status}): ${errorBody.message || 'Error desconocido'}`);
      }

      const result: VirusScanOutput = await response.json();
      return result;

    } catch (error: any) {
      console.error('Fallo en la llamada a la API de ClamAV:', error);
      throw new Error(`Error al contactar el servicio de antivirus: ${error.message}`);
    }
  }
);
