'use server';
/**
 * @fileOverview An AI agent to verify and diagnose the health of a domain's DNS records for email.
 *
 * - verifyDnsHealth - A function that uses AI to analyze DNS records.
 * - DnsHealthInput - The input type for the verifyDnsHealth function.
 * - DnsHealthOutput - The return type for the verifyDnsHealth function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import dns from 'node:dns/promises';

export type DnsHealthInput = z.infer<typeof DnsHealthInputSchema>;
const DnsHealthInputSchema = z.object({
  domain: z.string().describe('The domain name to check.'),
  dkimPublicKey: z.string().describe('The expected DKIM public key for the "daybuu" selector.'),
});

export type DnsHealthOutput = z.infer<typeof DnsHealthOutputSchema>;
const DnsHealthOutputSchema = z.object({
  spfStatus: z.enum(['verified', 'unverified', 'not-found']).describe('Status of the SPF record.'),
  dkimStatus: z.enum(['verified', 'unverified', 'not-found']).describe('Status of the DKIM record.'),
  dmarcStatus: z.enum(['verified', 'unverified', 'not-found']).describe('Status of the DMARC record.'),
  analysis: z.string().describe('A natural language analysis of the findings, explaining what is wrong and how to fix it, if needed. Be concise and direct. Respond in Spanish and always use emojis.'),
});

export async function verifyDnsHealth(
  input: DnsHealthInput
): Promise<DnsHealthOutput | null> {
  try {
    return await dnsHealthCheckFlow(input);
  } catch (error) {
    console.error("Flow execution failed:", error);
    // Propagate the original error message
    throw error;
  }
}

const getTxtRecords = async (name: string): Promise<string[]> => {
  try {
    // resolveTxt can return string[][]
    const records = await dns.resolveTxt(name);
    // Flatten and join to handle split TXT records
    return records.map(rec => rec.join(''));
  } catch (error: any) {
    if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
      return [];
    }
    // Re-throw other errors
    throw error;
  }
};


const dnsHealthCheckFlow = ai.defineFlow(
  {
    name: 'dnsHealthCheckFlow',
    inputSchema: DnsHealthInputSchema,
    outputSchema: DnsHealthOutputSchema,
  },
  async ({ domain, dkimPublicKey }) => {
    
    const [spfRecords, dkimRecords, dmarcRecords] = await Promise.all([
      getTxtRecords(domain),
      getTxtRecords(`daybuu._domainkey.${domain}`),
      getTxtRecords(`_dmarc.${domain}`),
    ]);

    const expertPrompt = ai.definePrompt({
        name: 'dnsHealthExpertPrompt',
        output: { schema: DnsHealthOutputSchema },
        prompt: `Analiza un registro TXT de un dominio y determina si es un registro SPF válido siguiendo estas reglas estrictas:

Identificación del registro SPF Si no existe ningún registro TXT que comience con v=spf1, ignóralo y continúa con otros registros. Si sí comienza con v=spf1, procede a la verificación.

Reglas de validación El registro debe comenzar con v=spf1 como primera cadena. El registro debe contener la cadena include:_spf.daybuu.com en cualquier posición del registro, antes o después de otros mecanismos que inicien con:

include:

ip4:

ip6:

a

mx o de cualquier otra cadena o servicio de correo.

El registro debe terminar con -all como última cadena.

Puede incluir mecanismos de otros servicios de correo, siempre que estén unificados en un solo registro SPF, pero lo importante es que se encuentre la cadena include:_spf.daybuu.com.

Solo se permiten los mecanismos:

include:

ip4:

ip6:

a

mx

Los mecanismos permitidos pueden repetirse o combinarse libremente, pero el total de mecanismos (sin contar v=spf1 y -all) no puede exceder 8.

Validación estructural Analiza la sintaxis y estructura completa para detectar si el registro está mal formado, incluso si contiene las cadenas correctas. Solo puede existir un registro SPF por dominio. Si hay más de uno, la verificación falla y debe unificarse en un único registro que incluya todos los mecanismos permitidos.

Resultado esperado Considera "verificado con éxito" cualquier registro SPF que cumpla todas las reglas anteriores, incluso si incluye mecanismos de otros servicios de correo, siempre que include:_spf.daybuu.com esté presente y las demás condiciones se cumplan. TAMBIEN Si al analizar el registro SPF detectas que supera el límite de 10 búsquedas DNS, explica al usuario de forma clara y sencilla lo siguiente: Motivo del fallo:

El estándar SPF (definido en el documento oficial RFC 7208) establece un máximo de 10 búsquedas DNS durante la verificación.

Esto se hace para evitar sobrecarga en los servidores y que la validación sea rápida.

Todos los servidores de correo (Gmail, Outlook, Zoho, etc.) aplican este mismo límite.

Ejemplo fácil de entender:

Imagina que el límite de 10 búsquedas es como una mochila con 10 espacios.

Google Workspace, solo con su include:_spf.google.com, mete 8 o 9 cosas en la mochila.

Si luego quieres añadir otro servicio que ocupa 3 espacios, ya no cabe todo → la mochila se rompe y el SPF falla.

Cómo funciona la búsqueda DNS:

Cada vez que el SPF usa mecanismos como include:, a, mx, ptr, exists o redirect=, el servidor tiene que hacer una pregunta DNS para saber qué IPs están autorizadas.

Si se necesitan más de 10 preguntas, el servidor deja de preguntar y marca el SPF como fallido.

Por qué seguir las sugerencias de la IA:

La IA puede ayudarte a optimizar el registro SPF para que no supere el límite.

Esto puede implicar unificar servicios en un solo registro, reducir includes innecesarios o reemplazarlos por rangos de IP (ip4: o ip6:).

Seguir estas sugerencias asegura que tu SPF pase la verificación y que tus correos no sean rechazados.

Dato adicional:

Algunos servicios son “devoradores” de búsquedas DNS porque usan muchos include: anidados.

El más común es Google Workspace, Microsoft 365, Salesforce que por sí solo puede consumir casi todo el límite.`,
    });

    const { output } = await expertPrompt({
        domain,
        dkimPublicKey,
        spfRecords: JSON.stringify(spfRecords),
        dkimRecords: JSON.stringify(dkimRecords),
        dmarcRecords: JSON.stringify(dmarcRecords),
    });

    if (!output) {
      throw new Error("La IA no pudo generar un análisis.");
    }
    
    return output;
  }
);
