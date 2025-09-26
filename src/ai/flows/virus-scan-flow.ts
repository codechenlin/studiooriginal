'use server';
/**
 * @fileOverview A flow to scan a file for viruses using the deployed ajilaag/clamav-rest API.
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
    const apiUrl = 'https://apiantivirus.fanton.cloud/scan';

    try {
      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: 'application/octet-stream' });
      formData.append('file', blob, fileName);

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      // The API uses different HTTP status codes to indicate the result.
      // 406 means a virus was found.
      // 200 means the file is clean.
      // Other codes indicate an error.

      if (response.status === 200) {
        // Clean file
        return {
          success: true,
          isInfected: false,
          message: 'El archivo es seguro. No se encontraron amenazas.',
        };
      } else if (response.status === 406) {
        // Infected file
        const result = await response.json();
        const description = result.Description || 'Amenaza desconocida';
        return {
          success: true,
          isInfected: true,
          message: `¡Peligro! Se encontró una amenaza: ${description}.`,
        };
      } else {
        // Handle other potential errors from the API
        const errorBody = await response.json().catch(() => ({ Description: `Error del servidor con código: ${response.status}` }));
        throw new Error(errorBody.Description || `Error en la API de antivirus: ${response.statusText}`);
      }

    } catch (error: any) {
      console.error('Fallo en la llamada a la API de ClamAV:', error);
      throw new Error(`Error al contactar el servicio de antivirus: ${error.message}`);
    }
  }
);
