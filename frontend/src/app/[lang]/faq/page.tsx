import type { Metadata } from 'next';
import { Lang, SITE_URL } from '@/lib/types';
import { api } from '@/lib/api';
import { t } from '@/lib/i18n';
import FaqAccordion from '@/components/faq/FaqAccordion';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const isFr = lang === 'fr';
  const title = isFr ? 'Questions Fréquentes — Fondation Luz de Benín' : 'Preguntas Frecuentes — Fundación Luz de Benín';
  const description = isFr
    ? 'Tout ce que vous devez savoir sur la Fondation Luz de Benín, nos projets en Bénin et comment vous pouvez collaborer.'
    : 'Todo lo que necesitas saber sobre la Fundación Luz de Benín, nuestros proyectos en Benín y cómo puedes colaborar.';
  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${lang}/faq/`,
      languages: {
        'es': `${SITE_URL}/es/faq/`,
        'fr': `${SITE_URL}/fr/faq/`,
        'x-default': `${SITE_URL}/es/faq/`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${lang}/faq/`,
      type: 'website',
      images: [{ url: `${SITE_URL}/logo.jpg`, width: 800, height: 600 }],
    },
  };
}

export default async function FaqPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = lang as Lang;
  const faqs = await api.getFaqs().catch(() => []);

  const faqItems = faqs.map(f => ({
    question: l === 'es' ? f.questionEs : f.questionFr,
    answer: l === 'es' ? f.answerEs : f.answerFr,
  })).filter(f => f.question && f.answer);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t(l, 'faq.breadcrumbHome'), item: `${SITE_URL}/${l}/` },
      { '@type': 'ListItem', position: 2, name: t(l, 'faq.breadcrumbFaq'), item: `${SITE_URL}/${l}/faq/` },
    ],
  };

  const faqLd = faqItems.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }
    : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      )}

      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{t(l, 'faq.title')}</h1>
          <p className="text-lg text-gray-600">{t(l, 'faq.subtitle')}</p>
        </div>

        {faqItems.length === 0
          ? <p className="text-center text-gray-500">{t(l, 'faq.noFaqs')}</p>
          : <FaqAccordion items={faqItems} />
        }
      </section>
    </>
  );
}
