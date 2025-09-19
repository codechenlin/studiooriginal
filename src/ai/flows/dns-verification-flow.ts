
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
  analysis: z.string().describe('A natural language analysis of the findings, explaining what is wrong and how to fix it, if needed. Be concise and direct.'),
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
        prompt: `Instrucción para la IA: Analiza un registro TXT de un dominio y determina si es un registro SPF válido siguiendo estas reglas estrictas. Responde en español y usa emojis para hacer la respuesta más amigable (ej. ✅, ❌, ⚠️).

        Registros DNS encontrados para el dominio {{domain}}:
        - Registros TXT en {{domain}}: {{{spfRecords}}}
        - Registros TXT en daybuu._domainkey.{{domain}}: {{{dkimRecords}}}
        - Registros TXT en _dmarc.{{domain}}: {{{dmarcRecords}}}

        Reglas de verificación por tipo:

        1. SPF
        - Identificación del registro SPF:
          - Si no existe ningún registro TXT que comience con "v=spf1", ignóralo y marca el estado como "not-found".
          - Si sí comienza con "v=spf1", procede a la verificación.
        - Validación estructural:
          - Analiza la sintaxis y estructura completa para detectar si el registro está mal formado, incluso si contiene las cadenas correctas.
          - Solo puede existir un registro SPF por dominio. Si hay más de uno que comience con "v=spf1", la verificación falla y debes explicar que deben unificarse.
        - Reglas de validación de contenido:
          - El registro debe comenzar con "v=spf1" como primera cadena.
          - El registro debe contener la cadena "include:_spf.daybuu.com" en cualquier posición.
          - El registro debe terminar con "-all" como última cadena.
          - Puede incluir otros mecanismos como "include:", "ip4:", "ip6:", "a", "mx". Estos no son un error.
        - Límite de Búsquedas DNS:
          - Si al analizar el registro SPF detectas que supera el límite de 10 búsquedas DNS (mecanismos como include, a, mx, exists, redirect), el registro es inválido. Debes explicar al usuario de forma clara y sencilla:
            - Motivo del fallo: El estándar SPF (RFC 7208) establece un máximo de 10 búsquedas DNS para evitar sobrecarga. Todos los servidores de correo aplican este límite.
            - Ejemplo: "Imagina que el límite de 10 búsquedas es como una mochila con 10 espacios. Google Workspace, con su 'include:_spf.google.com', ya usa 8 o 9 espacios. Si añades otro servicio, la mochila se rompe y el SPF falla."
            - Dato adicional: "Algunos servicios como Google Workspace, Microsoft 365 o Salesforce son “devoradores” de búsquedas DNS."
        - Resultado esperado:
          - Considera "verificado con éxito" cualquier registro SPF que cumpla todas las reglas, incluso si incluye otros servicios, siempre que "include:_spf.daybuu.com" esté presente y no se superen los límites.

        2. DKIM
        - Verificar que el Host/Nombre sea "daybuu._domainkey".
        - Puede haber varios registros DKIM en el mismo dominio, cada uno con un selector diferente. No se unifican. Nos enfocamos solo en el selector 'daybuu'.
        - El valor debe contener: "v=DKIM1;", "k=rsa;", y "p={{dkimPublicKey}}".
        - Confirma que la clave pública coincide con la generada por el proyecto.
        - Si respondes al usuario con el registro DKIM, muestra solo el inicio así: "v=DKIM1; k=rsa; p=MIIBIjA...".

        3. DMARC
        - Solo un registro por dominio.
        - Host/Nombre debe ser "_dmarc".
        - El valor debe contener: "v=DMARC1;", "p=reject;", "pct=100;", "sp=reject;".
        - "aspf" debe tener valor "s" (para dominio principal) o "r" (para subdominio).
        - "adkim" debe tener valor "s" (para dominio principal) o "r" (para subdominio).

        Instrucciones Adicionales:
        - No analices ni respondas sobre registros TXT que no sean para SPF, DKIM o DMARC (ej. google-site-verification, etc).
        - Indica claramente si cada registro cumple o no y explica qué falta o está mal.
        - Si un registro es CNAME para estos casos, márcalo como fallo.`
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

    
