
'use server';
/**
 * @fileOverview A flow to scan a file for viruses using ClamAV.
 *
 * - scanFileForViruses - A function that handles the virus scanning process.
 * - VirusScanInput - The input type for the scanFileForViruses function.
 * - VirusScanOutput - The return type for the scanFileForViruses function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import ClamScan from 'clamscan';
import { Readable } from 'stream';

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
    try {
      const clamscan = new ClamScan({
        clamdscan: {
          host: 'localhost', // Connect to the host machine where Docker exposes the port
          port: 3310,
          timeout: 60000,
        },
        preference: 'clamdscan',
      });

      await clamscan.init();

      // Convert data URI to a buffer
      const base64Data = fileDataUri.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Convert buffer to a readable stream
      const stream = Readable.from(buffer);

      const { is_infected, viruses } = await clamscan.scan_stream(stream);

      return {
        isInfected: is_infected ?? false,
        viruses: viruses || [],
      };
    } catch (error: any) {
      console.error('Virus Scan Error:', error);
      
      if (error.message && error.message.includes('ECONNREFUSED')) {
        return {
            isInfected: false,
            viruses: [],
            error: "No se pudo conectar al servicio de antivirus. Asegúrate de que el contenedor de Docker 'clamav' esté en funcionamiento y accesible en el puerto 3310."
        };
      }
      
      return {
        isInfected: false,
        viruses: [],
        error: `Error al escanear el archivo: ${error.message}`,
      };
    }
  }
);
