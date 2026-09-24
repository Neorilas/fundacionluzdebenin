import { toMetaDescription } from './seo';

export interface LlmsTxtData {
  site: string;
  projects: { slug: string; titleEs: string; titleFr: string; descEs: string; metaDescEs?: string | null }[];
  campaigns: { slug: string; titleEs: string; titleFr: string; taglineEs?: string | null }[];
  posts: { slug: string; titleEs: string; titleFr: string; excerptEs: string }[];
}

const oneLine = (text: string) => text.replace(/\s+/g, ' ').trim();

function link(site: string, path: string, name: string, desc?: string): string {
  const d = desc ? oneLine(desc) : '';
  return `- [${oneLine(name)}](${site}${path})${d ? `: ${d}` : ''}`;
}

/**
 * Builds /llms.txt (https://llmstxt.org): a Markdown index of the site
 * so AI assistants can understand and cite the foundation's content.
 */
export function buildLlmsTxt({ site, projects, campaigns, posts }: LlmsTxtData): string {
  const base = site.replace(/\/+$/, '');
  const lines: string[] = [
    '# Fundación Luz de Benín',
    '',
    '> Fundación española sin ánimo de lucro (en francés, Fondation Lumière du Bénin) que desde 2012 apoya a cuatro orfanatos de la región de Cotonou (Benín, África Occidental) y, desde 2026, a madres solteras embarazadas con formación para que sean independientes. Se financia con donaciones deducibles (80% en el IRPF en España) y con su propia granja avícola.',
    '',
    'Proyectos principales: una granja avícola que produce más de 300.000 huevos al año con huerto propio (abastece a los orfanatos y genera ingresos), una residencia de 3 viviendas que sirve de albergue y de consulta de enfermería para los niños, y la compra de recursos en el propio Benín en lugar de enviar contenedores desde España, para impulsar la economía local.',
    '',
    'La web está en español (/es/) y francés (/fr/); las URLs de ambos idiomas usan el mismo slug.',
    '',
    '## Páginas principales',
    '',
    link(base, '/es/quienes-somos/', 'Quiénes somos', 'historia, equipo y valores de la fundación'),
    link(base, '/es/que-hacemos/', 'Qué hacemos', 'áreas de trabajo en Benín'),
    link(base, '/es/proyectos/', 'Proyectos', 'listado de proyectos activos, completados y planificados'),
    link(base, '/es/colabora/', 'Colabora / Dona', 'donación puntual o mensual y deducciones fiscales'),
    link(base, '/es/colabora-empresas/', 'Colabora como empresa o autónomo', 'deducción en el Impuesto sobre Sociedades'),
    link(base, '/es/faq/', 'Preguntas frecuentes'),
    link(base, '/es/contacto/', 'Contacto'),
  ];

  if (projects.length) {
    lines.push('', '## Proyectos', '');
    for (const p of projects) {
      lines.push(link(base, `/es/proyectos/${p.slug}/`, p.titleEs, toMetaDescription((p.metaDescEs || '').trim() || p.descEs)));
    }
  }

  if (campaigns.length) {
    lines.push('', '## Campañas de apadrinamiento', '');
    for (const c of campaigns) {
      lines.push(link(base, `/es/campanas/${c.slug}/`, c.titleEs, c.taglineEs || ''));
    }
  }

  if (posts.length) {
    lines.push('', '## Blog', '');
    for (const p of posts) {
      lines.push(link(base, `/es/blog/${p.slug}/`, p.titleEs, toMetaDescription(p.excerptEs)));
    }
  }

  lines.push(
    '',
    '## Optional',
    '',
    link(base, '/fr/', 'Version française', 'Fondation Lumière du Bénin'),
    link(base, '/sitemap.xml', 'Sitemap'),
    link(base, '/api/blog/rss?lang=es', 'RSS del blog'),
    '',
  );

  return lines.join('\n');
}
