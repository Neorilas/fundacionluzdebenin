import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.adminUser.upsert({
    where: { email: 'admin@fundacionluzdebenin.org' },
    update: {},
    create: {
      email: 'admin@fundacionluzdebenin.org',
      passwordHash,
      name: 'Administrador',
    },
  });
  console.log('✅ Admin user created: admin@fundacionluzdebenin.org / admin123');

  // Settings
  const settings = [
    { key: 'siteName', value: 'Fundación Luz de Benín' },
    { key: 'siteNameFr', value: 'Fondation Lumière du Bénin' },
    { key: 'emailContact', value: 'info@fundacionluzdebenin.org' },
    { key: 'phoneContact', value: '+34 612 345 678' },
    { key: 'address', value: 'Madrid, España' },
    { key: 'bankAccount', value: 'Fundación Luz de Benín' },
    { key: 'bankIban', value: 'ES12 3456 7890 1234 5678 9012' },
    { key: 'bankBic', value: 'CAIXESBBXXX' },
    { key: 'socialFacebook', value: 'https://facebook.com/fundacionluzdebenin' },
    { key: 'socialInstagram', value: 'https://instagram.com/fundacionluzdebenin' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log('✅ Settings created');

  // Page sections
  const pageSections = [
    // Home - Hero
    { page: 'home', section: 'hero', key: 'title', valueEs: 'Llevamos Luz a Benín', valueFr: 'Nous apportons la Lumière au Bénin' },
    { page: 'home', section: 'hero', key: 'subtitle', valueEs: 'Educación, salud y desarrollo sostenible para las comunidades más vulnerables de África Occidental', valueFr: 'Éducation, santé et développement durable pour les communautés les plus vulnérables d\'Afrique de l\'Ouest' },
    { page: 'home', section: 'hero', key: 'cta1', valueEs: 'Conoce nuestros proyectos', valueFr: 'Découvrez nos projets' },
    { page: 'home', section: 'hero', key: 'cta2', valueEs: 'Colabora con nosotros', valueFr: 'Collaborez avec nous' },
    // Home - Mission
    { page: 'home', section: 'mission', key: 'title', valueEs: 'Nuestra Misión', valueFr: 'Notre Mission' },
    { page: 'home', section: 'mission', key: 'text', valueEs: 'Trabajamos para mejorar las condiciones de vida de las comunidades rurales de Benín, a través de proyectos sostenibles de educación, sanidad y desarrollo económico.', valueFr: 'Nous travaillons pour améliorer les conditions de vie des communautés rurales du Bénin, grâce à des projets durables d\'éducation, de santé et de développement économique.' },
    // Home - Stats
    { page: 'home', section: 'stats', key: 'children', valueEs: '1.200+ niños', valueFr: '1 200+ enfants' },
    { page: 'home', section: 'stats', key: 'childrenLabel', valueEs: 'beneficiados con educación', valueFr: 'bénéficiaires de l\'éducation' },
    { page: 'home', section: 'stats', key: 'villages', valueEs: '15', valueFr: '15' },
    { page: 'home', section: 'stats', key: 'villagesLabel', valueEs: 'aldeas atendidas', valueFr: 'villages accompagnés' },
    { page: 'home', section: 'stats', key: 'years', valueEs: '12', valueFr: '12' },
    { page: 'home', section: 'stats', key: 'yearsLabel', valueEs: 'años de trabajo', valueFr: 'années de travail' },
    { page: 'home', section: 'stats', key: 'projects', valueEs: '45+', valueFr: '45+' },
    { page: 'home', section: 'stats', key: 'projectsLabel', valueEs: 'proyectos realizados', valueFr: 'projets réalisés' },
    // Que hacemos
    { page: 'que-hacemos', section: 'hero', key: 'title', valueEs: 'Qué Hacemos', valueFr: 'Ce Que Nous Faisons' },
    { page: 'que-hacemos', section: 'hero', key: 'subtitle', valueEs: 'Tres pilares fundamentales guían cada uno de nuestros proyectos', valueFr: 'Trois piliers fondamentaux guident chacun de nos projets' },
    { page: 'que-hacemos', section: 'education', key: 'icon', valueEs: '📚', valueFr: '📚' },
    { page: 'que-hacemos', section: 'education', key: 'title', valueEs: 'Educación', valueFr: 'Éducation' },
    { page: 'que-hacemos', section: 'education', key: 'text', valueEs: 'Construimos escuelas, formamos maestros y becamos a niños y jóvenes con talento para que puedan acceder a una educación de calidad.', valueFr: 'Nous construisons des écoles, formons des enseignants et accordons des bourses aux enfants et jeunes talentueux pour accéder à une éducation de qualité.' },
    { page: 'que-hacemos', section: 'health', key: 'icon', valueEs: '🏥', valueFr: '🏥' },
    { page: 'que-hacemos', section: 'health', key: 'title', valueEs: 'Salud', valueFr: 'Santé' },
    { page: 'que-hacemos', section: 'health', key: 'text', valueEs: 'Apoyamos centros de salud rurales, campañas de vacunación y formación en higiene y nutrición para las comunidades más alejadas.', valueFr: 'Nous soutenons les centres de santé ruraux, les campagnes de vaccination et la formation en hygiène et nutrition pour les communautés les plus éloignées.' },
    { page: 'que-hacemos', section: 'development', key: 'icon', valueEs: '🌱', valueFr: '🌱' },
    { page: 'que-hacemos', section: 'development', key: 'title', valueEs: 'Desarrollo', valueFr: 'Développement' },
    { page: 'que-hacemos', section: 'development', key: 'text', valueEs: 'Promovemos la agricultura sostenible, la microempresa y la formación profesional para que las comunidades sean económicamente independientes.', valueFr: 'Nous promouvons l\'agriculture durable, la micro-entreprise et la formation professionnelle pour que les communautés soient économiquement indépendantes.' },
    // Quienes somos
    { page: 'quienes-somos', section: 'hero', key: 'title', valueEs: 'Quiénes Somos', valueFr: 'Qui Sommes-Nous' },
    { page: 'quienes-somos', section: 'hero', key: 'subtitle', valueEs: 'Un equipo comprometido con el desarrollo humano integral', valueFr: 'Une équipe engagée pour le développement humain intégral' },
    { page: 'quienes-somos', section: 'history', key: 'title', valueEs: 'Nuestra Historia', valueFr: 'Notre Histoire' },
    { page: 'quienes-somos', section: 'history', key: 'text', valueEs: 'Fundada en 2012 por un grupo de cooperantes españoles con experiencia en Benín, la fundación nació del convencimiento de que la solidaridad bien organizada puede transformar vidas. Desde entonces, hemos crecido hasta convertirnos en una organización de referencia en el desarrollo sostenible en África Occidental.', valueFr: 'Fondée en 2012 par un groupe de coopérants espagnols ayant de l\'expérience au Bénin, la fondation est née de la conviction qu\'une solidarité bien organisée peut transformer des vies. Depuis lors, nous sommes devenus une organisation de référence dans le développement durable en Afrique de l\'Ouest.' },
    // Colabora
    { page: 'colabora', section: 'hero', key: 'title', valueEs: 'Colabora con Nosotros', valueFr: 'Collaborez avec Nous' },
    { page: 'colabora', section: 'hero', key: 'subtitle', valueEs: 'Tu ayuda, en cualquier forma, cambia vidas en Benín', valueFr: 'Votre aide, sous toute forme, change des vies au Bénin' },
    { page: 'colabora', section: 'donation', key: 'title', valueEs: 'Donación por Transferencia', valueFr: 'Don par Virement' },
    { page: 'colabora', section: 'donation', key: 'text', valueEs: 'Puedes realizar tu donación mediante transferencia bancaria. Todos los fondos recibidos se destinan íntegramente a nuestros proyectos en Benín.', valueFr: 'Vous pouvez effectuer votre don par virement bancaire. Tous les fonds reçus sont entièrement destinés à nos projets au Bénin.' },
    { page: 'colabora', section: 'impact', key: '10eur', valueEs: 'Con 10€ cubrimos los libros de texto de un niño durante un trimestre', valueFr: 'Avec 10€ nous couvrons les manuels scolaires d\'un enfant pour un trimestre' },
    { page: 'colabora', section: 'impact', key: '30eur', valueEs: 'Con 30€ pagamos la matrícula escolar anual de un alumno', valueFr: 'Avec 30€ nous payons les frais de scolarité annuels d\'un élève' },
    { page: 'colabora', section: 'impact', key: '100eur', valueEs: 'Con 100€ equipamos un aula con material didáctico básico', valueFr: 'Avec 100€ nous équipons une salle de classe avec du matériel pédagogique de base' },
    { page: 'colabora', section: 'impact', key: '500eur', valueEs: 'Con 500€ financiamos la construcción de un pozo de agua potable', valueFr: 'Avec 500€ nous finançons la construction d\'un puits d\'eau potable' },
  ];

  for (const section of pageSections) {
    await prisma.pageSection.upsert({
      where: { page_section_key: { page: section.page, section: section.section, key: section.key } },
      update: { valueEs: section.valueEs, valueFr: section.valueFr },
      create: section,
    });
  }
  console.log('✅ Page sections created');

  // Projects
  const projects = [
    {
      slug: 'orfanatos-apoyo-integral',
      titleEs: 'Apoyo Integral a Orfanatos',
      titleFr: 'Soutien Intégral aux Orphelinats',
      descEs: 'Apoyamos a cuatro orfanatos de la región con ropa, mobiliario, energía solar, alimentación y acompañamiento continuo. Cada niño merece crecer con dignidad y esperanza.',
      descFr: "Nous soutenons quatre orphelinats de la région avec des vêtements, du mobilier, de l'énergie solaire, de la nourriture et un accompagnement continu. Chaque enfant mérite de grandir dans la dignité.",
      status: 'active',
      featured: true,
      images: JSON.stringify([]),
      stats: JSON.stringify({ orfanatos: 4, ninos: 80, goal: 15000, raised: 9200 }),
      order: 1,
    },
    {
      slug: 'granja-avicola-sostenible',
      titleEs: 'Granja Avícola Sostenible',
      titleFr: 'Ferme Avicole Durable',
      descEs: 'Nuestra granja cuenta con 2.500 gallinas y produce más de 300.000 huevos al año. Genera ingresos estables que financian los orfanatos y crea riqueza local en la comunidad.',
      descFr: "Notre ferme compte 2 500 poules et produit plus de 300 000 œufs par an. Elle génère des revenus stables qui financent les orphelinats et crée de la richesse locale dans la communauté.",
      status: 'active',
      featured: true,
      images: JSON.stringify([]),
      stats: JSON.stringify({ gallinas: 2500, huevos_ano: 300000, goal: 25000, raised: 21500 }),
      order: 2,
    },
    {
      slug: 'madres-solteras-embarazadas',
      titleEs: 'Acompañamiento a Madres Solteras',
      titleFr: 'Accompagnement des Mères Célibataires',
      descEs: 'Acompañamos a madres solteras embarazadas con apoyo emocional, formación profesional y recursos para que puedan salir adelante junto a sus hijos con autonomía y dignidad.',
      descFr: "Nous accompagnons les mères célibataires enceintes avec un soutien émotionnel, une formation professionnelle et des ressources pour qu'elles puissent avancer avec leurs enfants dans l'autonomie.",
      status: 'active',
      featured: true,
      images: JSON.stringify([]),
      stats: JSON.stringify({ beneficiarias: 24, goal: 12000, raised: 4800 }),
      order: 3,
    },
    {
      slug: 'expansion-granja-2025',
      titleEs: 'Expansión de la Granja 2025',
      titleFr: 'Extension de la Ferme 2025',
      descEs: 'Queremos ampliar la granja con 1.000 gallinas más y un huerto de yuca para aumentar los ingresos y la autosuficiencia alimentaria de los orfanatos que apoyamos.',
      descFr: "Nous souhaitons agrandir la ferme avec 1 000 poules supplémentaires et un jardin de manioc pour augmenter les revenus et l'autosuffisance alimentaire des orphelinats.",
      status: 'planned',
      featured: false,
      images: JSON.stringify([]),
      stats: JSON.stringify({ nuevas_gallinas: 1000, goal: 18000, raised: 2100 }),
      order: 4,
    },
  ];

  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: project,
      create: project,
    });
  }
  console.log('✅ Projects created');

  // Blog posts
  const posts = [
    {
      slug: 'inauguracion-escuela-akpakpa',
      titleEs: 'Inauguramos la Escuela Primaria de Akpakpa',
      titleFr: 'Inauguration de l\'École Primaire d\'Akpakpa',
      excerptEs: 'Tras dos años de trabajo, la nueva escuela primaria de Akpakpa ha abierto sus puertas a 300 niños del barrio.',
      excerptFr: 'Après deux ans de travail, la nouvelle école primaire d\'Akpakpa a ouvert ses portes à 300 enfants du quartier.',
      contentEs: `# Inauguramos la Escuela Primaria de Akpakpa

El pasado 15 de enero fue un día histórico para la comunidad de Akpakpa, en Cotonou. Tras más de dos años de trabajo conjunto entre la fundación, las autoridades locales y los vecinos, la nueva escuela primaria abrió sus puertas por primera vez.

## Un proyecto de toda la comunidad

La construcción de la escuela no habría sido posible sin la implicación activa de la comunidad. Los vecinos participaron en las obras, aportando trabajo voluntario en los fines de semana. Las familias organizaron turnos para vigilar los materiales de construcción durante las noches.

## 300 niños con un futuro mejor

La escuela cuenta con 8 aulas luminosas, una biblioteca con más de 500 libros, servicios sanitarios diferenciados y una amplia zona de recreo. En total, 300 niños del barrio podrán recibir una educación de calidad en unas instalaciones dignas.

## Gracias a todos los donantes

Este proyecto fue posible gracias a la generosidad de más de 200 donantes particulares y tres empresas que creyeron en nuestra misión. Desde aquí, queremos transmitirles el agradecimiento de toda la comunidad de Akpakpa.`,
      contentFr: `# Inauguration de l'École Primaire d'Akpakpa

Le 15 janvier dernier a été un jour historique pour la communauté d'Akpakpa, à Cotonou. Après plus de deux ans de travail conjoint entre la fondation, les autorités locales et les habitants, la nouvelle école primaire a ouvert ses portes pour la première fois.

## Un projet de toute la communauté

La construction de l'école n'aurait pas été possible sans l'implication active de la communauté. Les habitants ont participé aux travaux, apportant leur travail bénévole les week-ends. Les familles ont organisé des tours de garde pour surveiller les matériaux de construction pendant les nuits.

## 300 enfants avec un avenir meilleur

L'école dispose de 8 salles de classe lumineuses, d'une bibliothèque avec plus de 500 livres, de sanitaires différenciés et d'une grande cour de récréation. Au total, 300 enfants du quartier pourront recevoir une éducation de qualité dans des installations dignes.`,
      published: true,
      publishedAt: new Date('2024-01-20'),
    },
    {
      slug: 'programa-salud-materno-infantil',
      titleEs: 'Nuestro Programa de Salud Materno-Infantil cumple 3 años',
      titleFr: 'Notre Programme de Santé Materno-Infantile fête ses 3 ans',
      excerptEs: 'El programa ha atendido a más de 1.500 madres y recién nacidos en las zonas rurales de Benín durante estos tres años.',
      excerptFr: 'Le programme a suivi plus de 1 500 mères et nouveau-nés dans les zones rurales du Bénin au cours de ces trois années.',
      contentEs: `# Tres años salvando vidas

Hace tres años lanzamos nuestro programa de salud materno-infantil en las zonas rurales de Benín. Hoy, con orgullo, podemos decir que ha atendido a más de 1.500 madres y sus recién nacidos.

## Impacto en números

- **1.542 partos** asistidos por personal cualificado
- **98%** de tasa de supervivencia neonatal en las zonas atendidas
- **45 comadronas** formadas en técnicas modernas
- **12 aldeas** con acceso a atención prenatal regular

## El camino por delante

Aunque los resultados son alentadores, queda mucho trabajo por hacer. Nuestra próxima meta es extender el programa a 8 aldeas adicionales en la región de Atacora.`,
      contentFr: `# Trois ans à sauver des vies

Il y a trois ans, nous avons lancé notre programme de santé materno-infantile dans les zones rurales du Bénin. Aujourd'hui, avec fierté, nous pouvons dire qu'il a suivi plus de 1 500 mères et leurs nouveau-nés.

## Impact en chiffres

- **1 542 accouchements** assistés par du personnel qualifié
- **98%** de taux de survie néonatale dans les zones accompagnées
- **45 sages-femmes** formées aux techniques modernes
- **12 villages** avec accès aux soins prénatals réguliers`,
      published: true,
      publishedAt: new Date('2024-02-10'),
    },
  ];

  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }
  console.log('✅ Blog posts created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('👤 Admin login: admin@fundacionluzdebenin.org / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
