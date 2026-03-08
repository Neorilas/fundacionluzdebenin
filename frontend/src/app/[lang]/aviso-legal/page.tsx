import type { Metadata } from 'next';
import { Lang, Settings } from '@/lib/types';
import { api } from '@/lib/api';

export const metadata: Metadata = { robots: 'noindex' };

export default async function AvisoLegalPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const es = l === 'es';

  const settings: Settings = await api.getSettings().catch(() => ({} as Settings));
  const nif = settings.foundationNif || 'G-XXXXXXXX';
  const registry = settings.foundationRegistry || 'Registro de Fundaciones';
  const email = settings.emailContact || 'info@fundacionluzdebenin.org';

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">

        {/* Header */}
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          {es ? 'Aviso Legal, Privacidad y Cookies' : 'Mentions légales, confidentialité et cookies'}
        </h1>
        <p className="text-sm text-gray-400 mb-12">
          {es ? 'Última actualización: marzo 2026' : 'Dernière mise à jour : mars 2026'}
        </p>

        {/* ── 1. Aviso Legal ── */}
        <section id="aviso-legal" className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
            {es ? '1. Aviso Legal' : '1. Mentions légales'}
          </h2>
          <div className="prose prose-sm text-gray-600 space-y-3">
            <p>
              {es
                ? 'En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se informa:'
                : 'Conformément à l\'article 10 de la loi espagnole 34/2002 sur les services de la société de l\'information (LSSI-CE) :'}
            </p>
            <ul className="space-y-2 list-none pl-0">
              {[
                { label: es ? 'Denominación social' : 'Dénomination sociale', value: 'Fundación Luz de Benín' },
                { label: 'NIF', value: nif },
                { label: es ? 'Registro' : 'Enregistrement', value: registry },
                { label: es ? 'Domicilio social' : 'Siège social', value: 'Madrid, España' },
                { label: es ? 'Correo electrónico' : 'Courriel', value: email },
                { label: 'Web', value: 'https://fundacionluzdebenin.org' },
              ].map(({ label, value }) => (
                <li key={label} className="flex gap-2">
                  <span className="font-semibold text-gray-700 shrink-0">{label}:</span>
                  <span>{value}</span>
                </li>
              ))}
            </ul>
            <p>
              {es
                ? 'La Fundación Luz de Benín es una entidad sin ánimo de lucro constituida al amparo de la legislación española, inscrita en el Registro de Fundaciones del Ministerio de Justicia.'
                : 'La Fondation Luz de Benín est une entité à but non lucratif constituée conformément à la législation espagnole, inscrite au Registre des Fondations du Ministère de la Justice.'}
            </p>
          </div>
        </section>

        {/* ── 2. Política de Privacidad ── */}
        <section id="privacidad" className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
            {es ? '2. Política de Privacidad' : '2. Politique de confidentialité'}
          </h2>
          <div className="text-gray-600 text-sm space-y-4">

            <div>
              <h3 className="font-semibold text-gray-800 mb-1">{es ? 'Responsable del tratamiento' : 'Responsable du traitement'}</h3>
              <p>{es ? 'Fundación Luz de Benín — ' : 'Fondation Luz de Benín — '}{email}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-1">{es ? 'Datos que recogemos' : 'Données collectées'}</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>{es ? 'Formulario de contacto: nombre, email, mensaje.' : 'Formulaire de contact : nom, email, message.'}</li>
                <li>{es ? 'Donaciones: nombre, email y DNI/NIF (opcional, para certificado fiscal).' : 'Dons : nom, email et NIE/NIF (optionnel, pour reçu fiscal).'}</li>
                <li>{es ? 'Newsletter: dirección de email.' : 'Newsletter : adresse email.'}</li>
                <li>{es ? 'Datos de navegación (solo si acepta cookies analíticas).' : 'Données de navigation (uniquement si vous acceptez les cookies analytiques).'}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-1">{es ? 'Finalidad y base jurídica' : 'Finalité et base juridique'}</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>{es ? 'Responder consultas y gestionar donaciones (interés legítimo / ejecución de contrato).' : 'Répondre aux demandes et gérer les dons (intérêt légitime / exécution du contrat).'}</li>
                <li>{es ? 'Emisión de certificados fiscales (obligación legal — Ley 49/2002).' : 'Émission de reçus fiscaux (obligation légale).'}</li>
                <li>{es ? 'Envío de boletín de noticias (consentimiento del usuario).' : 'Envoi de la newsletter (consentement de l\'utilisateur).'}</li>
                <li>{es ? 'Analítica web (consentimiento — solo si acepta cookies).' : 'Analytique web (consentement — uniquement si vous acceptez les cookies).'}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-1">{es ? 'Conservación de datos' : 'Conservation des données'}</h3>
              <p>{es
                ? 'Los datos se conservan el tiempo necesario para la finalidad recogida y, en caso de donaciones, durante los plazos legales exigidos (mínimo 4 años por obligaciones fiscales).'
                : 'Les données sont conservées le temps nécessaire à la finalité collectée et, pour les dons, pendant les délais légaux requis (minimum 4 ans pour les obligations fiscales).'}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-1">{es ? 'Destinatarios' : 'Destinataires'}</h3>
              <p>{es
                ? 'Los datos no se ceden a terceros, salvo proveedores de servicio necesarios (Stripe para pagos, Resend para email, Mailchimp para newsletter, Google para analítica si acepta cookies) y cuando sea exigido por ley.'
                : 'Les données ne sont pas cédées à des tiers, sauf prestataires nécessaires (Stripe, Resend, Mailchimp, Google Analytics si vous acceptez les cookies) et lorsque la loi l\'exige.'}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-1">{es ? 'Sus derechos (RGPD)' : 'Vos droits (RGPD)'}</h3>
              <p>{es
                ? 'Puede ejercer sus derechos de acceso, rectificación, supresión, limitación, portabilidad y oposición escribiendo a '
                : 'Vous pouvez exercer vos droits d\'accès, rectification, suppression, limitation, portabilité et opposition en écrivant à '}
                <a href={`mailto:${email}`} className="text-primary-800 underline">{email}</a>
                {es ? '. Tiene derecho a presentar una reclamación ante la AEPD (www.aepd.es).' : '. Vous avez le droit de déposer une réclamation auprès de la CNIL.'}
              </p>
            </div>

          </div>
        </section>

        {/* ── 3. Política de Cookies ── */}
        <section id="cookies" className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
            {es ? '3. Política de Cookies' : '3. Politique de cookies'}
          </h2>
          <div className="text-gray-600 text-sm space-y-4">

            <p>{es
              ? 'Una cookie es un pequeño fichero que se almacena en su navegador. Esta web utiliza los siguientes tipos:'
              : 'Un cookie est un petit fichier stocké dans votre navigateur. Ce site utilise les types suivants :'}</p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-2 border border-gray-200 font-semibold text-gray-700">Cookie</th>
                    <th className="text-left p-2 border border-gray-200 font-semibold text-gray-700">{es ? 'Tipo' : 'Type'}</th>
                    <th className="text-left p-2 border border-gray-200 font-semibold text-gray-700">{es ? 'Finalidad' : 'Finalité'}</th>
                    <th className="text-left p-2 border border-gray-200 font-semibold text-gray-700">{es ? 'Duración' : 'Durée'}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-gray-200 font-mono">cookie_consent</td>
                    <td className="p-2 border border-gray-200">{es ? 'Técnica' : 'Technique'}</td>
                    <td className="p-2 border border-gray-200">{es ? 'Guardar su preferencia de cookies' : 'Enregistrer votre préférence'}</td>
                    <td className="p-2 border border-gray-200">{es ? '1 año' : '1 an'}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-2 border border-gray-200 font-mono">_ga, _ga_*</td>
                    <td className="p-2 border border-gray-200">{es ? 'Analítica' : 'Analytique'}</td>
                    <td className="p-2 border border-gray-200">{es ? 'Google Analytics — estadísticas de uso anónimas' : 'Google Analytics — statistiques d\'usage anonymes'}</td>
                    <td className="p-2 border border-gray-200">2 {es ? 'años' : 'ans'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-semibold text-gray-800 mb-2">{es ? 'Gestionar preferencias' : 'Gérer les préférences'}</p>
              <p>{es
                ? 'Puede retirar su consentimiento en cualquier momento borrando las cookies de su navegador o usando los controles de privacidad del mismo. También puede contactarnos en '
                : 'Vous pouvez retirer votre consentement à tout moment en supprimant les cookies de votre navigateur. Vous pouvez également nous contacter à '}
                <a href={`mailto:${email}`} className="text-primary-800 underline">{email}</a>.
              </p>
            </div>

          </div>
        </section>

        <p className="text-xs text-gray-400 border-t border-gray-100 pt-6">
          {es
            ? 'Este aviso legal se rige por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales de Madrid.'
            : 'Ces mentions légales sont régies par la législation espagnole. Tout litige sera soumis aux juridictions de Madrid.'}
        </p>

      </div>
    </div>
  );
}
