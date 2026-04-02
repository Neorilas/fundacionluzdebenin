import Link from 'next/link';
import { Lang } from '@/lib/types';

import { PageSections } from '@/lib/types';

interface Props {
  lang: Lang;
  sec?: PageSections;
}

const pillars = {
  es: [
    {
      icon: '🏠',
      title: 'Orfanatos',
      desc: 'Apoyamos orfanatos en Benín con ropa, mobiliario, material escolar, electricidad solar y alimentación procedente de nuestra granja.',
      href: '/es/proyectos/',
    },
    {
      icon: '🤱',
      title: 'Madres Solteras',
      desc: 'Acompañamos a madres solteras embarazadas con ayuda material y formación profesional para que alcancen la autosuficiencia.',
      href: '/es/proyectos/',
    },
    {
      icon: '🌾',
      title: 'Economía Sostenible',
      desc: 'Nuestra granja de pollos y huerto de yuca genera recursos propios para los orfanatos y las familias de la comunidad.',
      href: '/es/proyectos/',
    },
  ],
  fr: [
    {
      icon: '🏠',
      title: 'Orphelinats',
      desc: 'Nous soutenons des orphelinats au Bénin avec des vêtements, du mobilier, du matériel scolaire, de l\'électricité solaire et de la nourriture.',
      href: '/fr/proyectos/',
    },
    {
      icon: '🤱',
      title: 'Mères Célibataires',
      desc: 'Nous accompagnons les mères célibataires enceintes avec une aide matérielle et une formation professionnelle pour leur autonomie.',
      href: '/fr/proyectos/',
    },
    {
      icon: '🌾',
      title: 'Économie Durable',
      desc: 'Notre ferme avicole et notre jardin de manioc génèrent des ressources pour les orphelinats et les familles de la communauté.',
      href: '/fr/proyectos/',
    },
  ],
};

export default function MissionStrip({ lang, sec }: Props) {
  const title = sec?.mission?.title?.[lang] || '';
  const text = sec?.mission?.text?.[lang] || '';
  const href = `/${lang}/proyectos/`;
  const items = [
    {
      icon: sec?.pillar1?.icon?.[lang] || pillars[lang][0].icon,
      title: sec?.pillar1?.title?.[lang] || pillars[lang][0].title,
      desc: sec?.pillar1?.desc?.[lang] || pillars[lang][0].desc,
      href,
    },
    {
      icon: sec?.pillar2?.icon?.[lang] || pillars[lang][1].icon,
      title: sec?.pillar2?.title?.[lang] || pillars[lang][1].title,
      desc: sec?.pillar2?.desc?.[lang] || pillars[lang][1].desc,
      href,
    },
    {
      icon: sec?.pillar3?.icon?.[lang] || pillars[lang][2].icon,
      title: sec?.pillar3?.title?.[lang] || pillars[lang][2].title,
      desc: sec?.pillar3?.desc?.[lang] || pillars[lang][2].desc,
      href,
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Mission text */}
        {(title || text) && (
          <div className="max-w-3xl mx-auto text-center mb-14">
            {title && <h2 className="text-3xl font-bold text-primary-800 mb-4">{title}</h2>}
            {text && <p className="text-gray-600 text-lg leading-relaxed">{text}</p>}
          </div>
        )}

        {/* Three pillars */}
        <div className="grid md:grid-cols-3 gap-6">
          {items.map(({ icon, title: pTitle, desc, href }) => (
            <div
              key={pTitle}
              className="group relative bg-primary-50 border border-primary-100 rounded-2xl p-8 hover:border-primary-300 hover:shadow-md transition-all"
            >
              <div className="text-5xl mb-5">{icon}</div>
              <h3 className="text-xl font-bold text-primary-900 mb-3">{pTitle}</h3>
              <p className="text-gray-600 leading-relaxed text-sm mb-5">{desc}</p>
              <Link
                href={href}
                aria-label={lang === 'es' ? `Ver proyectos de ${pTitle}` : `Voir les projets — ${pTitle}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 group-hover:text-accent transition-colors"
              >
                {lang === 'es' ? 'Saber más' : 'En savoir plus'} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
