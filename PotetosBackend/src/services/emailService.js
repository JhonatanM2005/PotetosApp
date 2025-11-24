const BREVO_API_URL =
  process.env.BREVO_API_URL || "https://api.brevo.com/v3/smtp/email";
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || "POTETOS Restaurant";

const isBrevoConfigured = () => {
  if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL) {
    console.warn(
      "⚠️ Servicio de email no configurado: faltan BREVO_API_KEY o BREVO_SENDER_EMAIL"
    );
    return false;
  }
  return true;
};

const sendEmailThroughBrevo = async ({ to, subject, html }) => {
  if (!isBrevoConfigured()) {
    throw new Error("Email service not configured");
  }

  const payload = {
    sender: {
      email: BREVO_SENDER_EMAIL,
      name: BREVO_SENDER_NAME,
    },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": BREVO_API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Brevo API error (${response.status} ${response.statusText}): ${errorBody}`
    );
  }

  const data = await response.json();
  return data;
};

/**
 * Genera el header HTML con logo para los emails
 */
const getEmailHeader = (subtitle = "Restaurant ERP System") => {
  // Logo desde Imgur - URL directa
  const logoUrl = "https://i.imgur.com/KBHRrEp.png";
  
  return `
    <div class="header">
      <div style="text-align: center;">
        <img src="${logoUrl}" alt="POTETOS" style="max-width: 200px; height: auto; margin: 0 auto; display: block;" />
        <p style="margin: 10px 0 0 0; font-size: 16px; color: #f2ba52;">${subtitle}</p>
      </div>
    </div>
  `;
};

/**
 * Estilos CSS comunes para todos los emails
 */
const getEmailStyles = () => {
  return `
    <style>
      body {
        font-family: 'Arial', sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .header {
        background: linear-gradient(135deg, #060133 0%, #1a0a4e 100%);
        color: #f2ba52;
        padding: 30px;
        text-align: center;
      }
      .content {
        padding: 40px 30px;
        color: #333;
      }
      .info-box {
        background-color: #fff3cd;
        border-left: 4px solid #f2ba52;
        padding: 15px;
        margin: 20px 0;
        border-radius: 5px;
      }
      .detail-table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      .detail-table td {
        padding: 10px;
        border-bottom: 1px solid #eee;
      }
      .detail-table td:first-child {
        font-weight: bold;
        color: #060133;
        width: 40%;
      }
      .footer {
        background-color: #f8f9fa;
        padding: 20px;
        text-align: center;
        color: #666;
        font-size: 14px;
      }
      .btn {
        display: inline-block;
        padding: 12px 30px;
        background-color: #060133;
        color: #f2ba52;
        text-decoration: none;
        border-radius: 25px;
        font-weight: bold;
        margin-top: 20px;
      }
      .code-box {
        background: linear-gradient(135deg, #060133 0%, #1a0a4e 100%);
        color: #f2ba52;
        font-size: 36px;
        font-weight: bold;
        text-align: center;
        padding: 20px;
        border-radius: 10px;
        margin: 30px 0;
        letter-spacing: 8px;
      }
    </style>
  `;
};

/**
 * Enviar código de recuperación de contraseña
 */
const sendPasswordResetCode = async (email, code) => {
  const html = `
      <!DOCTYPE html>
      <html>
        <head>
          ${getEmailStyles()}
        </head>
        <body>
          <div class="container">
            ${getEmailHeader("Restaurant ERP System")}
            <div class="content">
              <h2 style="color: #060133;">Recuperación de Contraseña</h2>
              <p>Hola,</p>
              <p>Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código de verificación:</p>
              
              <div class="code-box">
                ${code}
              </div>
              
              <div class="info-box">
                <strong>⏰ Importante:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Este código es válido por <strong>15 minutos</strong></li>
                  <li>Solo puedes usarlo <strong>una vez</strong></li>
                  <li>Tienes un máximo de <strong>3 intentos</strong> para ingresar el código correcto</li>
                </ul>
              </div>
              
              <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este mensaje de forma segura.</p>
              
              <p style="margin-top: 30px;">
                <strong>Saludos,</strong><br>
                El equipo de POTETOS
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} POTETOS Restaurant. Todos los derechos reservados.</p>
              <p style="margin-top: 10px; color: #999; font-size: 12px;">
                Este es un correo automático, por favor no respondas a este mensaje.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

  try {
    const response = await sendEmailThroughBrevo({
      to: email,
      subject: "🔐 Código de Recuperación de Contraseña - POTETOS",
      html,
    });
    return { success: true, response };
  } catch (error) {
    console.error("❌ Error al enviar email:", error);
    throw error;
  }
};

/**
 * Enviar email de confirmación de recepción de reserva
 */
const sendReservationCreatedEmail = async (reservationData) => {
  const { email, customer_name, reservation_date, reservation_time, number_of_people, notes } = reservationData;
  
  const formattedDate = new Date(reservation_date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        ${getEmailStyles()}
      </head>
      <body>
        <div class="container">
          ${getEmailHeader("Restaurant")}
          <div class="content">
            <h2 style="color: #060133;">¡Reserva Recibida!</h2>
            <p>Hola <strong>${customer_name}</strong>,</p>
            <p>Hemos recibido tu solicitud de reserva. A continuación, los detalles:</p>
            
            <table class="detail-table">
              <tr>
                <td>📅 Fecha:</td>
                <td>${formattedDate}</td>
              </tr>
              <tr>
                <td>🕐 Hora:</td>
                <td>${reservation_time}</td>
              </tr>
              <tr>
                <td>👥 Personas:</td>
                <td>${number_of_people}</td>
              </tr>
              ${notes ? `
              <tr>
                <td>📝 Notas:</td>
                <td>${notes}</td>
              </tr>
              ` : ''}
            </table>
            
            <div class="info-box">
              <strong>📞 Próximos pasos:</strong>
              <p style="margin: 10px 0 0 0;">
                Nuestro equipo revisará tu solicitud y te contactaremos pronto para confirmar tu reserva.
              </p>
            </div>
            
            <p style="margin-top: 30px;">
              <strong>¡Gracias por elegirnos!</strong><br>
              El equipo de POTETOS
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} POTETOS Restaurant. Todos los derechos reservados.</p>
            <p style="margin-top: 10px; color: #999; font-size: 12px;">
              Este es un correo automático, por favor no respondas a este mensaje.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const response = await sendEmailThroughBrevo({
      to: email,
      subject: "✅ Reserva Recibida - POTETOS Restaurant",
      html,
    });
    return { success: true, response };
  } catch (error) {
    console.error("❌ Error al enviar email de reserva creada:", error);
    throw error;
  }
};

/**
 * Enviar email de confirmación oficial de reserva
 */
const sendReservationConfirmedEmail = async (reservationData) => {
  const { email, customer_name, reservation_date, reservation_time, number_of_people, notes } = reservationData;
  
  const formattedDate = new Date(reservation_date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        ${getEmailStyles()}
      </head>
      <body>
        <div class="container">
          ${getEmailHeader("Restaurant")}
          <div class="content">
            <h2 style="color: #060133;">🎉 ¡Reserva Confirmada!</h2>
            <p>Hola <strong>${customer_name}</strong>,</p>
            <p>¡Excelentes noticias! Tu reserva ha sido <strong>confirmada</strong>.</p>
            
            <table class="detail-table">
              <tr>
                <td>📅 Fecha:</td>
                <td>${formattedDate}</td>
              </tr>
              <tr>
                <td>🕐 Hora:</td>
                <td>${reservation_time}</td>
              </tr>
              <tr>
                <td>👥 Personas:</td>
                <td>${number_of_people}</td>
              </tr>
              ${notes ? `
              <tr>
                <td>📝 Notas:</td>
                <td>${notes}</td>
              </tr>
              ` : ''}
            </table>
            
            <div class="info-box">
              <strong>📍 Información importante:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Por favor, llega 10 minutos antes de tu hora de reserva</li>
                <li>Si necesitas cancelar o modificar, contáctanos con anticipación</li>
                <li>Esperamos verte pronto</li>
              </ul>
            </div>
            
            <p style="margin-top: 30px;">
              <strong>¡Te esperamos!</strong><br>
              El equipo de POTETOS
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} POTETOS Restaurant. Todos los derechos reservados.</p>
            <p style="margin-top: 10px; color: #999; font-size: 12px;">
              Este es un correo automático, por favor no respondas a este mensaje.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const response = await sendEmailThroughBrevo({
      to: email,
      subject: "🎉 Reserva Confirmada - POTETOS Restaurant",
      html,
    });
    return { success: true, response };
  } catch (error) {
    console.error("❌ Error al enviar email de reserva confirmada:", error);
    throw error;
  }
};

/**
 * Enviar email de cancelación de reserva
 */
const sendReservationCancelledEmail = async (reservationData) => {
  const { email, customer_name, reservation_date, reservation_time } = reservationData;
  
  const formattedDate = new Date(reservation_date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        ${getEmailStyles()}
      </head>
      <body>
        <div class="container">
          ${getEmailHeader("Restaurant")}
          <div class="content">
            <h2 style="color: #060133;">Reserva Cancelada</h2>
            <p>Hola <strong>${customer_name}</strong>,</p>
            <p>Te confirmamos que tu reserva ha sido <strong>cancelada</strong>.</p>
            
            <table class="detail-table">
              <tr>
                <td>📅 Fecha:</td>
                <td>${formattedDate}</td>
              </tr>
              <tr>
                <td>🕐 Hora:</td>
                <td>${reservation_time}</td>
              </tr>
            </table>
            
            <div class="info-box">
              <strong>💡 ¿Cambio de planes?</strong>
              <p style="margin: 10px 0 0 0;">
                No te preocupes, puedes hacer una nueva reserva cuando lo desees. ¡Estaremos encantados de recibirte!
              </p>
            </div>
            
            <p style="margin-top: 30px;">
              <strong>Esperamos verte pronto,</strong><br>
              El equipo de POTETOS
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} POTETOS Restaurant. Todos los derechos reservados.</p>
            <p style="margin-top: 10px; color: #999; font-size: 12px;">
              Este es un correo automático, por favor no respondas a este mensaje.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const response = await sendEmailThroughBrevo({
      to: email,
      subject: "Reserva Cancelada - POTETOS Restaurant",
      html,
    });
    return { success: true, response };
  } catch (error) {
    console.error("❌ Error al enviar email de reserva cancelada:", error);
    throw error;
  }
};

module.exports = {
  sendPasswordResetCode,
  sendReservationCreatedEmail,
  sendReservationConfirmedEmail,
  sendReservationCancelledEmail,
};
