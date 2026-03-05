const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = 'noreply@fundacionluzdebenin.org';
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'info@fundacionluzdebenin.org';

export async function sendContactNotification(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  if (!RESEND_API_KEY) return; // Silent if not configured yet

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Formulario Web <${FROM_EMAIL}>`,
        to: [CONTACT_EMAIL],
        reply_to: data.email,
        subject: `[Contacto Web] ${data.subject}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#065F46;padding:24px 32px;border-radius:12px 12px 0 0;">
              <h1 style="color:#fff;margin:0;font-size:20px;">Nuevo mensaje de contacto</h1>
            </div>
            <div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:14px;width:100px;vertical-align:top;">Nombre</td>
                  <td style="padding:8px 0;font-weight:600;font-size:14px;">${escapeHtml(data.name)}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:14px;vertical-align:top;">Email</td>
                  <td style="padding:8px 0;font-size:14px;"><a href="mailto:${escapeHtml(data.email)}" style="color:#065F46;">${escapeHtml(data.email)}</a></td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:14px;vertical-align:top;">Asunto</td>
                  <td style="padding:8px 0;font-size:14px;">${escapeHtml(data.subject)}</td>
                </tr>
              </table>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
              <p style="color:#374151;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(data.message)}</p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
              <p style="color:#9ca3af;font-size:12px;margin:0;">
                Puedes responder directamente a este email para contactar con ${escapeHtml(data.name)}.
              </p>
            </div>
          </div>
        `,
      }),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    // Non-critical — don't fail the API response if email fails
  }
}

export async function sendContactConfirmation(data: {
  name: string;
  email: string;
  subject: string;
  lang?: string;
}): Promise<void> {
  if (!RESEND_API_KEY) return;

  const es = data.lang !== 'fr';
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Fundación Luz de Benín <${FROM_EMAIL}>`,
        to: [data.email],
        subject: es
          ? `Hemos recibido tu mensaje — Fundación Luz de Benín`
          : `Nous avons reçu votre message — Fondation Luz de Benín`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#065F46;padding:24px 32px;border-radius:12px 12px 0 0;">
              <h1 style="color:#fff;margin:0;font-size:20px;">
                ${es ? 'Gracias por contactarnos' : 'Merci de nous avoir contactés'}
              </h1>
            </div>
            <div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
              <p style="color:#374151;font-size:15px;line-height:1.6;">
                ${es ? `Hola ${escapeHtml(data.name)},` : `Bonjour ${escapeHtml(data.name)},`}
              </p>
              <p style="color:#374151;font-size:15px;line-height:1.6;">
                ${es
                  ? `Hemos recibido tu mensaje sobre "<strong>${escapeHtml(data.subject)}</strong>" y te responderemos lo antes posible.`
                  : `Nous avons reçu votre message concernant "<strong>${escapeHtml(data.subject)}</strong>" et nous vous répondrons dans les meilleurs délais.`
                }
              </p>
              <p style="color:#6b7280;font-size:13px;line-height:1.6;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:16px;">
                ${es
                  ? 'Fundación Luz de Benín · info@fundacionluzdebenin.org · fundacionluzdebenin.org'
                  : 'Fondation Luz de Benín · info@fundacionluzdebenin.org · fundacionluzdebenin.org'
                }
              </p>
            </div>
          </div>
        `,
      }),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    // Non-critical
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
