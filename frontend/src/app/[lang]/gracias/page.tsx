import type { Metadata } from 'next';
import Link from 'next/link';
import { Lang } from '@/lib/types';
import NewsletterInline from '@/components/ui/NewsletterInline';

export const metadata: Metadata = { robots: 'noindex' };

type ThanksType = 'contact' | 'donation' | 'subscription' | 'apadrinamiento' | 'newsletter';

interface Content {
  emoji: string;
  badge: Record<Lang, string>;
  title: Record<Lang, string>;
  subtitle: Record<Lang, string>;
  details?: Record<Lang, string>;
  cta1: Record<Lang, { label: string; href: string }>;
  cta2: Record<Lang, { label: string; href: string }>;
  bg: string;
  badgeColor: string;
  showNewsletter: boolean;
}

const CONTENT: Record<ThanksType, Content> = {
  contact: {
    emoji: '💚',
    badge: { es: 'Mensaje enviado', fr: 'Message envoyé' },
    title: { es: '¡Mensaje enviado!', fr: 'Message envoyé !' },
    subtitle: {
      es: 'Gracias por ponerte en contacto con nosotros. Te responderemos lo antes posible, normalmente en menos de 48 horas.',
      fr: 'Merci de nous avoir contactés. Nous vous répondrons dans les meilleurs délais, généralement sous 48 heures.',
    },
    cta1: {
      es: { label: '← Volver al inicio', href: '/es/' },
      fr: { label: '← Retour à l\'accueil', href: '/fr/' },
    },
    cta2: {
      es: { label: 'Apoya nuestra misión ❤️', href: '/es/colabora/' },
      fr: { label: 'Soutenir notre mission ❤️', href: '/fr/colabora/' },
    },
    bg: 'from-emerald-50 via-white to-white',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    showNewsletter: false,
  },
  donation: {
    emoji: '💛',
    badge: { es: 'Donación completada', fr: 'Don effectué' },
    title: { es: '¡Gracias por tu donación!', fr: 'Merci pour votre don !' },
    subtitle: {
      es: 'Tu generosidad transforma vidas en Benín. Cada euro contribuye directamente a nuestros proyectos de educación, salud y desarrollo.',
      fr: 'Votre générosité transforme des vies au Bénin. Chaque euro contribue directement à nos projets d\'éducation, de santé et de développement.',
    },
    details: {
      es: 'Recibirás una confirmación por email de Stripe. Si facilitaste tu DNI/NIF, generaremos tu certificado fiscal anual (Ley 49/2002).',
      fr: 'Vous recevrez une confirmation par email de Stripe. Si vous avez fourni votre NIE/NIF, nous générerons votre certificat fiscal annuel.',
    },
    cta1: {
      es: { label: 'Ver nuestros proyectos', href: '/es/que-hacemos/' },
      fr: { label: 'Voir nos projets', href: '/fr/que-hacemos/' },
    },
    cta2: {
      es: { label: 'Volver al inicio', href: '/es/' },
      fr: { label: 'Retour à l\'accueil', href: '/fr/' },
    },
    bg: 'from-amber-50 via-white to-white',
    badgeColor: 'bg-amber-100 text-amber-800',
    showNewsletter: true,
  },
  subscription: {
    emoji: '🌟',
    badge: { es: 'Donación mensual activa', fr: 'Don mensuel actif' },
    title: { es: '¡Eres donante mensual!', fr: 'Vous êtes donateur mensuel !' },
    subtitle: {
      es: 'Tu apoyo recurrente es la base sobre la que construimos proyectos sostenibles. Gracias a personas como tú podemos planificar a largo plazo.',
      fr: 'Votre soutien récurrent est la base sur laquelle nous construisons des projets durables. Grâce à des personnes comme vous, nous pouvons planifier à long terme.',
    },
    details: {
      es: 'Recibirás una confirmación por email y podrás gestionar tu suscripción en cualquier momento desde el enlace que Stripe te enviará.',
      fr: 'Vous recevrez une confirmation par email et pourrez gérer votre abonnement à tout moment via le lien que Stripe vous enverra.',
    },
    cta1: {
      es: { label: 'Ver el impacto de tu ayuda', href: '/es/que-hacemos/' },
      fr: { label: 'Voir l\'impact de votre aide', href: '/fr/que-hacemos/' },
    },
    cta2: {
      es: { label: 'Volver al inicio', href: '/es/' },
      fr: { label: 'Retour à l\'accueil', href: '/fr/' },
    },
    bg: 'from-blue-50 via-white to-white',
    badgeColor: 'bg-blue-100 text-blue-800',
    showNewsletter: true,
  },
  apadrinamiento: {
    emoji: '🐾',
    badge: { es: 'Apadrinamiento activo', fr: 'Parrainage actif' },
    title: { es: '¡Bienvenido a la familia!', fr: 'Bienvenue dans la famille !' },
    subtitle: {
      es: 'Tu apadrinamiento mensual marca una diferencia real y duradera. Las familias de Benín agradecen tu compromiso continuo.',
      fr: 'Votre parrainage mensuel fait une vraie différence durable. Les familles du Bénin vous remercient pour votre engagement continu.',
    },
    details: {
      es: 'Recibirás actualizaciones periódicas sobre el impacto de tu apadrinamiento. Stripe te enviará confirmación por email.',
      fr: 'Vous recevrez des mises à jour régulières sur l\'impact de votre parrainage. Stripe vous enverra une confirmation par email.',
    },
    cta1: {
      es: { label: 'Ver todas las campañas', href: '/es/campanas/' },
      fr: { label: 'Voir toutes les campagnes', href: '/fr/campanas/' },
    },
    cta2: {
      es: { label: 'Volver al inicio', href: '/es/' },
      fr: { label: 'Retour à l\'accueil', href: '/fr/' },
    },
    bg: 'from-orange-50 via-white to-white',
    badgeColor: 'bg-orange-100 text-orange-800',
    showNewsletter: true,
  },
  newsletter: {
    emoji: '📬',
    badge: { es: 'Suscripción confirmada', fr: 'Abonnement confirmé' },
    title: { es: '¡Ya eres parte de la comunidad!', fr: 'Vous faites partie de la communauté !' },
    subtitle: {
      es: 'Te mantendremos informado sobre nuestros proyectos, campañas y cómo tu apoyo está cambiando vidas en Benín.',
      fr: 'Nous vous tiendrons informé de nos projets, campagnes et de la façon dont votre soutien change des vies au Bénin.',
    },
    cta1: {
      es: { label: 'Leer el blog', href: '/es/blog/' },
      fr: { label: 'Lire le blog', href: '/fr/blog/' },
    },
    cta2: {
      es: { label: 'Apoya nuestra misión', href: '/es/colabora/' },
      fr: { label: 'Soutenir notre mission', href: '/fr/colabora/' },
    },
    bg: 'from-violet-50 via-white to-white',
    badgeColor: 'bg-violet-100 text-violet-800',
    showNewsletter: false,
  },
};

const VALID_TYPES: ThanksType[] = ['contact', 'donation', 'subscription', 'apadrinamiento', 'newsletter'];

export default async function GraciasPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { lang } = await params;
  const { type: rawType } = await searchParams;
  const l = lang as Lang;

  const type: ThanksType = VALID_TYPES.includes(rawType as ThanksType)
    ? (rawType as ThanksType)
    : 'contact';

  const c = CONTENT[type];

  return (
    <div className={`min-h-[80vh] bg-gradient-to-b ${c.bg} flex items-center justify-center px-4 py-24`}>
      <div className="max-w-xl w-full text-center">

        {/* Status badge */}
        <div className="flex justify-center mb-8">
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-full tracking-wide uppercase ${c.badgeColor}`}>
            ✓ {c.badge[l]}
          </span>
        </div>

        {/* Emoji */}
        <div className="text-8xl mb-6 leading-none select-none">{c.emoji}</div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
          {c.title[l]}
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-600 mb-4 leading-relaxed">
          {c.subtitle[l]}
        </p>

        {/* Details */}
        {c.details && (
          <p className="text-sm text-gray-400 mb-8 leading-relaxed max-w-md mx-auto">
            {c.details[l]}
          </p>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link
            href={c.cta1[l].href}
            className="inline-flex items-center justify-center bg-primary-800 hover:bg-primary-900 text-white font-semibold px-7 py-3.5 rounded-full transition-colors"
          >
            {c.cta1[l].label}
          </Link>
          <Link
            href={c.cta2[l].href}
            className="inline-flex items-center justify-center border-2 border-primary-800 text-primary-800 hover:bg-primary-50 font-semibold px-7 py-3.5 rounded-full transition-colors"
          >
            {c.cta2[l].label}
          </Link>
        </div>

        {/* Newsletter */}
        {c.showNewsletter && (
          <div className="mt-12">
            <NewsletterInline lang={l} />
          </div>
        )}
      </div>
    </div>
  );
}
