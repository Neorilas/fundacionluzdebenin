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

export async function sendNewsletterConfirmation(data: {
  email: string;
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
          ? 'Ya estás suscrito/a a nuestras noticias'
          : 'Vous êtes maintenant abonné(e) à nos actualités',
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#065F46;padding:24px 32px;border-radius:12px 12px 0 0;">
              <h1 style="color:#fff;margin:0;font-size:20px;">
                ${es ? '¡Bienvenido/a!' : 'Bienvenue !'}
              </h1>
            </div>
            <div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
              <p style="color:#374151;font-size:15px;line-height:1.6;">
                ${es
                  ? 'Gracias por unirte a la familia de la <strong>Fundación Luz de Benín</strong>. Trabajamos cada día por los niños de cuatro orfanatos en Cotonou (Benín, África Occidental). Solo escribimos cuando hay algo que merece la pena contar: noticias desde Benín, avances en los proyectos y formas concretas de ayudar.'
                  : 'Merci de rejoindre la famille de la <strong>Fondation Luz de Benín</strong>. Nous travaillons chaque jour pour les enfants de quatre orphelinats à Cotonou (Bénin, Afrique de l\'Ouest). Nous n\'écrivons que lorsqu\'il y a quelque chose qui vaut la peine d\'être partagé : nouvelles du Bénin, avancées des projets et façons concrètes d\'aider.'
                }
              </p>
              <div style="text-align:center;margin:28px 0;">
                <a href="${es ? 'https://fundacionluzdebenin.org/es/que-hacemos/' : 'https://fundacionluzdebenin.org/fr/que-hacemos/'}"
                  style="display:inline-block;background:#065F46;color:#fff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
                  ${es ? 'Conoce nuestra misión &rarr;' : 'Découvrir notre mission &rarr;'}
                </a>
              </div>
              <p style="color:#6b7280;font-size:13px;line-height:1.6;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:16px;">
                ${es
                  ? 'Si no has solicitado esta suscripción, ignora este email. · Fundación Luz de Benín · fundacionluzdebenin.org'
                  : 'Si vous n\'avez pas demandé cet abonnement, ignorez cet email. · Fondation Luz de Benín · fundacionluzdebenin.org'
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

export async function sendSantoWelcome(data: {
  email: string;
  nombre?: string;
  santoNombre: string;
  lang?: string;
}): Promise<void> {
  if (!RESEND_API_KEY) return;

  const es = data.lang !== 'fr';
  const name = data.nombre ? data.nombre.split(' ')[0] : null;
  const greeting = es
    ? (name ? `Hola ${escapeHtml(name)},` : 'Hola,')
    : (name ? `Bonjour ${escapeHtml(name)},` : 'Bonjour,');

  const subject = es
    ? `Tu santo misionero: ${data.santoNombre}`
    : `Ton saint missionnaire : ${data.santoNombre}`;

  const html = es ? `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#065F46;padding:24px 32px;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:22px;">¡Bienvenido/a a la familia!</h1>
      </div>
      <div style="background:#fffbeb;padding:8px 32px;border-left:none;border-right:none;border:1px solid #fde68a;text-align:center;">
        <p style="color:#92400e;font-size:14px;margin:8px 0;">Tu santo misionero es</p>
        <p style="color:#78350f;font-size:26px;font-weight:800;margin:4px 0;">${escapeHtml(data.santoNombre)}</p>
      </div>
      <div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
        <p style="color:#374151;font-size:15px;line-height:1.6;">${greeting}</p>
        <p style="color:#374151;font-size:15px;line-height:1.6;">
          Acabas de descubrir a <strong>${escapeHtml(data.santoNombre)}</strong>, tu santo misionero en África. Cada persona que visita nuestra página recibe uno: es nuestra forma de recordar que detrás de cada misión hay una historia, una vida y una vocación.
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.6;">
          La <strong>Fundación Luz de Benín</strong> trabaja cada día por los niños de cuatro orfanatos en Cotonou (Benín, África Occidental). Gestionamos una granja avícola que produce más de 300.000 huevos al año para alimentar a los niños, y desde 2026 apoyamos también a madres solteras embarazadas para que puedan salir adelante.
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.6;">
          Gracias por acercarte a nuestra misión. Te mantendremos al tanto de todo lo que va pasando en Benín.
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin-top:24px;">Un abrazo,<br/><strong>El equipo de Fundación Luz de Benín</strong></p>
        <div style="text-align:center;margin:28px 0;">
          <a href="https://fundacionluzdebenin.org/es/que-hacemos/"
            style="display:inline-block;background:#065F46;color:#fff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
            Conoce nuestra misión &rarr;
          </a>
        </div>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="color:#9ca3af;font-size:12px;margin:0;">
          Fundación Luz de Benín · fundacionluzdebenin.org<br/>
          Si no reconoces este email, puedes ignorarlo.
        </p>
      </div>
    </div>
  ` : `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#065F46;padding:24px 32px;border-radius:12px 12px 0 0;">
        <h1 style="color:#fff;margin:0;font-size:22px;">Bienvenue dans la famille !</h1>
      </div>
      <div style="background:#fffbeb;padding:8px 32px;border:1px solid #fde68a;text-align:center;">
        <p style="color:#92400e;font-size:14px;margin:8px 0;">Ton saint missionnaire est</p>
        <p style="color:#78350f;font-size:26px;font-weight:800;margin:4px 0;">${escapeHtml(data.santoNombre)}</p>
      </div>
      <div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
        <p style="color:#374151;font-size:15px;line-height:1.6;">${greeting}</p>
        <p style="color:#374151;font-size:15px;line-height:1.6;">
          Tu viens de découvrir <strong>${escapeHtml(data.santoNombre)}</strong>, ton saint missionnaire en Afrique. Chaque personne qui visite notre page en reçoit un : c'est notre façon de rappeler que derrière chaque mission il y a une histoire, une vie, une vocation.
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.6;">
          La <strong>Fondation Luz de Benín</strong> oeuvre chaque jour pour les enfants de quatre orphelinats à Cotonou (Bénin, Afrique de l'Ouest). Nous gérons une ferme avicole qui produit plus de 300 000 oeufs par an pour nourrir les enfants, et depuis 2026 nous soutenons aussi des mères célibataires enceintes pour qu'elles puissent devenir autonomes.
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.6;">
          Merci de vous rapprocher de notre mission. Nous vous tiendrons informé(e) de tout ce qui se passe au Bénin.
        </p>
        <p style="color:#374151;font-size:15px;line-height:1.6;margin-top:24px;">Avec toute notre affection,<br/><strong>L'équipe de la Fondation Luz de Benín</strong></p>
        <div style="text-align:center;margin:28px 0;">
          <a href="https://fundacionluzdebenin.org/fr/que-hacemos/"
            style="display:inline-block;background:#065F46;color:#fff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;text-decoration:none;">
            Découvrir notre mission &rarr;
          </a>
        </div>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
        <p style="color:#9ca3af;font-size:12px;margin:0;">
          Fondation Luz de Benín · fundacionluzdebenin.org<br/>
          Si vous ne reconnaissez pas cet email, vous pouvez l'ignorer.
        </p>
      </div>
    </div>
  `;

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
        subject,
        html,
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
