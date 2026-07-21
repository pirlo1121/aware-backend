const jwt = require('jsonwebtoken');
const Subscriber = require('../models/Subscriber');
const { sendEmail } = require('./emailService');

const EMAIL_BATCH_SIZE = 20;

/**
 * Envía correos en lotes para no saturar la API de Resend (rate limits)
 * ni disparar cientos de requests concurrentes de golpe.
 */
const sendInBatches = async (items, sendFn, batchSize = EMAIL_BATCH_SIZE) => {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.allSettled(batch.map(sendFn));
  }
};

/**
 * Notifica a todos los subscriptores activos sobre un nuevo post publicado.
 * Los correos se envían en segundo plano (fire & forget) para no bloquear la respuesta HTTP.
 *
 * @param {Object} post - El post recién publicado (documento de Mongoose)
 */
const notifyNewPost = async (post) => {
  console.log(`[NotificationService] notifyNewPost llamado para: "${post.title}"`);

  try {
    const subscribers = await Subscriber.find({ status: 'active' }).lean();

    if (subscribers.length === 0) {
      console.log('[NotificationService] No hay subscriptores activos para notificar.');
      return;
    }

    console.log(`[NotificationService] ${subscribers.length} subscriptores activos encontrados.`);

    const postUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/posts/${post.slug}`;
    const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;

    const buildUnsubscribeUrl = (subscriberId) => {
      const token = jwt.sign({ id: subscriberId, purpose: 'unsubscribe' }, process.env.JWT_SECRET, {
        expiresIn: '365d',
      });
      return `${serverUrl}/api/subscribers/unsubscribe?token=${token}`;
    };

    const htmlTemplate = (subscriberName, unsubscribeUrl) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Aware - Nuevo artículo</title>
      </head>
      <body style="font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background: #f0f2f5; margin: 0; padding: 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="min-width: 100%;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">

                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px 30px; text-align: center;">
                    <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: 1px;">
                      Mind Mirror
                    </h1>
                    <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 6px 0 0 0; letter-spacing: 0.5px;">
                      NUEVO ARTÍCULO
                    </p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 36px 30px 24px;">
                    <p style="color: #4a4a6a; font-size: 15px; margin: 0 0 4px 0;">
                      Hola, <strong style="color: #1a1a2e;">${subscriberName}</strong>
                    </p>
                    <p style="color: #6b6b8a; font-size: 14px; margin: 0 0 20px 0;">
                      Hemos publicado un nuevo artículo:
                    </p>

                    <div style="background: #f8f9fc; border-left: 4px solid #1a1a2e; border-radius: 8px; padding: 20px 24px; margin-bottom: 24px;">
                      <h2 style="color: #1a1a2e; font-size: 20px; margin: 0 0 8px 0; line-height: 1.4;">
                        ${post.title}
                      </h2>
                      ${post.excerpt ? `<p style="color: #555; font-size: 14px; line-height: 1.7; margin: 0;">${post.excerpt}</p>` : ''}
                    </div>

                    <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                      <tr>
                        <td style="background: #1a1a2e; border-radius: 8px;">
                          <a href="${postUrl}" target="_blank" style="display: inline-block; padding: 14px 36px; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; letter-spacing: 0.3px;">
                            Leer artículo completo
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background: #f8f9fc; padding: 24px 30px;">
                    <p style="color: #999; font-size: 12px; line-height: 1.6; margin: 0;">
                      Estás recibiendo este correo porque te suscribiste a Aware.
                      Si prefieres no recibir más notificaciones, puedes
                      <a href="${unsubscribeUrl}" target="_blank" style="color: #1a1a2e; text-decoration: underline; font-weight: 600;">cancelar tu suscripción aquí</a>.
                    </p>
                    <p style="color: #bbb; font-size: 11px; margin: 12px 0 0 0;">
                      Aware &copy; ${new Date().getFullYear()} &mdash; Todos los derechos reservados.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await sendInBatches(subscribers, (sub) =>
      sendEmail({
        to: sub.email,
        subject: `Nuevo artículo: ${post.title}`,
        html: htmlTemplate(sub.name, buildUnsubscribeUrl(sub._id)),
      })
    );

    console.log(`[NotificationService] Proceso completado para ${subscribers.length} subscriptores.`);
  } catch (error) {
    console.error('[NotificationService] Error al notificar subscriptores:', error.message);
  }
};

module.exports = { notifyNewPost };
