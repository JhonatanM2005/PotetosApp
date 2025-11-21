const BREVO_API_URL =
  process.env.BREVO_API_URL || "https://api.brevo.com/v3/smtp/email";
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
const BREVO_SENDER_NAME =
  process.env.BREVO_SENDER_NAME || "POTETOS Restaurant";

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
 * Enviar código de recuperación de contraseña
 */
const sendPasswordResetCode = async (email, code) => {
  const html = `
      <!DOCTYPE html>
      <html>
        <head>
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
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .content {
              padding: 40px 30px;
              color: #333;
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
            .info {
              background-color: #fff3cd;
              border-left: 4px solid #f2ba52;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
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
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍟 POTETOS</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Restaurant ERP System</p>
            </div>
            <div class="content">
              <h2 style="color: #060133;">Recuperación de Contraseña</h2>
              <p>Hola,</p>
              <p>Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código de verificación:</p>
              
              <div class="code-box">
                ${code}
              </div>
              
              <div class="info">
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
    console.log("✅ Email enviado:", response.messageId || response.message);
    return { success: true, response };
  } catch (error) {
    console.error("❌ Error al enviar email:", error);
    throw error;
  }
};

module.exports = {
  sendPasswordResetCode,
};
