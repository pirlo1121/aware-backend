const { Resend } = require('resend');

let resendClient = null;

/**
 * Retorna una instancia de Resend creada bajo demanda.
 * Así nos asegurarmos de que dotenv ya haya cargado las variables de entorno.
 */
const getResend = () => {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === 're_xxxxxxxxxxxx') {
      console.warn('[EmailService] RESEND_API_KEY no está configurada en .env');
      return null;
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
};

/**
 * Envía un correo electrónico usando Resend.
 *
 * @param {Object} options
 * @param {string} options.to      - Destinatario
 * @param {string} options.subject - Asunto del correo
 * @param {string} options.html    - Cuerpo del correo en HTML
 */
const sendEmail = async ({ to, subject, html }) => {
  const resend = getResend();
  if (!resend) {
    console.error(`[EmailService] No se pudo enviar correo a ${to}: falta RESEND_API_KEY`);
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error(`[EmailService] Error de API al enviar a ${to}:`, error);
      return;
    }

    console.log(`[EmailService] Correo enviado a ${to} — id: ${data?.id}`);
  } catch (error) {
    console.error(`[EmailService] Error inesperado al enviar correo a ${to}:`, error.message);
    console.error(error);
  }
};

module.exports = { sendEmail };
