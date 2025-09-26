
'use server';
/**
 * @fileOverview A flow to scan a file for viruses using a local ClamAV daemon.
 *
 * - scanFileForVirus - A function that handles the virus scanning process.
 */

import { ai } from '@/ai/genkit';
import { VirusScanInput, VirusScanInputSchema, VirusScanOutput, VirusScanOutputSchema } from './virus-scan-types';
import NodeClam from 'clamscan';

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
    try {
      const clamscan = new NodeClam().init({
        clamdscan: {
          socket: '/var/run/clamav/clamd.sock', // Docker socket path
          host: '127.0.0.1', // Docker-compose service name
          port: 3310,
          timeout: 300000,
          multiscan: true,
          active: true
        },
        preference: 'clamdscan'
      });
      
      const clam = await clamscan;

      // Create a readable stream from the buffer
      const { Readable } = require('stream');
      const stream = Readable.from(fileBuffer);

      const { is_infected, file, viruses } = await clam.scan_stream(stream);

      if (is_infected) {
        return {
          isInfected: true,
          message: `¡Peligro! Se encontró la amenaza "${viruses[0]}" en el archivo ${fileName}.`,
        };
      } else {
        return {
          isInfected: false,
          message: 'El archivo es seguro. No se encontraron amenazas.',
        };
      }
    } catch (error: any) {
      console.error('Fallo en el escaneo de ClamAV:', error);
      // Provide a more specific error message if possible
      let errorMessage = 'Error desconocido al escanear el archivo.';
      if (error.message && error.message.includes('connect ECONNREFUSED')) {
        errorMessage = 'No se pudo conectar al servicio de antivirus. Asegúrate de que el contenedor de ClamAV esté funcionando.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      throw new Error(errorMessage);
    }
  }
);
