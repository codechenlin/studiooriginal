
'use server';
/**
 * @fileOverview A flow to send a test email via SMTP.
 *
 * - sendTestEmail - A function that handles sending a test email.
 * - SendTestEmailInput - The input type for the sendTestEmail function.
 * - SendTestEmailOutput - The return type for the sendTestEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import nodemailer from 'nodemailer';

const SendTestEmailInputSchema = z.object({
  host: z.string(),
  port: z.number(),
  secure: z.boolean(),
  auth: z.object({
    user: z.string(),
    pass: z.string(),
  }),
  from: z.string(),
  to: z.string(),
});
export type SendTestEmailInput = z.infer<typeof SendTestEmailInputSchema>;

const SendTestEmailOutputSchema = z.object({
  success: z.boolean(),
  messageId: z.string().optional(),
  error: z.string().optional(),
});
export type SendTestEmailOutput = z.infer<typeof SendTestEmailOutputSchema>;


export async function sendTestEmail(
  input: SendTestEmailInput
): Promise<SendTestEmailOutput> {
  return sendTestEmailFlow(input);
}

const sendTestEmailFlow = ai.defineFlow(
  {
    name: 'sendTestEmailFlow',
    inputSchema: SendTestEmailInputSchema,
    outputSchema: SendTestEmailOutputSchema,
  },
  async (input) => {
    try {
      const transporter = nodemailer.createTransport({
        host: input.host,
        port: input.port,
        secure: input.secure, // true for 465, false for other ports
        auth: {
          user: input.auth.user,
          pass: input.auth.pass,
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        }
      });

      // Verify connection configuration
      await transporter.verify();

      // Send mail with defined transport object
      const info = await transporter.sendMail({
        from: `Mailflow AI Test <${input.from}>`,
        to: input.to,
        subject: 'Correo de prueba de Mailflow AI',
        text: '¡Tu conexión SMTP está funcionando correctamente!',
        html: '<b>¡Tu conexión SMTP está funcionando correctamente!</b>',
      });

      return {
        success: true,
        messageId: info.messageId,
      };

    } catch (error: any) {
      console.error('SMTP Error:', error);
      
      let errorMessage = 'Ocurrió un error desconocido.';
       // Check for specific error responses from the server after authentication
      if (error.responseCode === 550 || (error.response && /recipient rejected|mailbox unavailable|no such user/i.test(error.response))) {
        errorMessage = `El correo de prueba fue rebotado por el servidor de destino. Código: ${error.responseCode}. Respuesta: ${error.response}`;
      } else if (error.code === 'EAUTH') {
        errorMessage = 'Autenticación fallida. Revisa tu usuario y contraseña.';
      } else if (error.code === 'ECONNREFUSED') {
         errorMessage = 'Conexión rechazada. Revisa el host, el puerto y la configuración de seguridad (TLS/SSL).';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
);

    
