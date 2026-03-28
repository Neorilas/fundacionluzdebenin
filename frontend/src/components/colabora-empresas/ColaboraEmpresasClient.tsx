'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

type Lang = 'es' | 'fr';
type Tab = 'autonomo' | 'empresa';

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function tx(lang: Lang, es: string, fr: string) {
  return lang === 'es' ? es : fr;
}

function NumberCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm text-center">
      <p className="text-3xl font-extrabold text-primary-800 leading-none mb-2">{value}</p>
      <p className="text-sm text-gray-500 leading-snug">{label}</p>
    </div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="flex gap-4 items-start">
      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-800 text-white text-sm font-bold flex items-center justify-center mt-0.5">
        {n}
      </span>
      <div>
        <p className="font-semibold text-gray-900 text-sm mb-0.5">{title}</p>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function LevelCard({
  color,
  title,
  price,
  items,
}: {
  color: 'dark' | 'medium' | 'light';
  title: string;
  price: string;
  items: string[];
}) {
  const bg =
    color === 'dark'
      ? 'bg-primary-900'
      : color === 'medium'
      ? 'bg-primary-800'
      : 'bg-primary-700';
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      <div className={`${bg} text-white px-4 py-3`}>
        <p className="font-bold text-sm">{title}</p>
        <p className="text-primary-100 text-xs mt-0.5">{price}</p>
      </div>
      <div className="bg-white p-4">
        <ul className="space-y-1.5">
          {items.map((it, i) => (
            <li key={i} className="text-xs text-gray-500 flex gap-2 items-start">
              <span className="text-primary-700 font-bold flex-shrink-0">→</span>
              {it}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Receipt({
  title,
  rows,
  total,
  totalValue,
}: {
  title: string;
  rows: Array<{ label: string; value: string }>;
  total: string;
  totalValue: string;
}) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 font-mono text-sm">
      <p className="text-xs font-sans font-bold uppercase tracking-wide text-primary-800 mb-3">{title}</p>
      {rows.map((r, i) => (
        <div key={i} className="flex justify-between text-gray-500 py-1 border-b border-dashed border-gray-200 last:border-0">
          <span>{r.label}</span>
          <span>{r.value}</span>
        </div>
      ))}
      <div className="flex justify-between font-bold text-gray-900 pt-2 mt-1">
        <span>{total}</span>
        <span className="text-accent">{totalValue}</span>
      </div>
    </div>
  );
}

// ── Tab Autónomos ──────────────────────────────────────────────────────────

function TabAutonomo({ lang }: { lang: Lang }) {
  const [donacionAnual, setDonacionAnual] = useState(360);

  const deduccion1 = Math.min(donacionAnual, 250) * 0.8;
  const deduccion2 = Math.max(donacionAnual - 250, 0) * 0.4;
  const devuelve = deduccion1 + deduccion2;
  const costeAnual = donacionAnual - devuelve;
  const costeMes = costeAnual / 12;

  const impactText = () => {
    if (costeMes < 5)
      return tx(lang,
        "Ayudas a que un niño desayune todos los días.",
        "Vous aidez un enfant à petit-déjeuner tous les jours."
      );
    if (costeMes < 15)
      return tx(lang,
        "Cubres la alimentación de las aves de la granja durante varios días.",
        "Vous couvrez l'alimentation des volailles de la ferme pendant plusieurs jours."
      );
    if (costeMes < 30)
      return tx(lang,
        "Pagas la atención veterinaria mensual del rebaño de ovejas.",
        "Vous payez les soins vétérinaires mensuels du troupeau."
      );
    return tx(lang,
      "Contribuyes a la maquinaria del centro de formación para madres solteras.",
      "Vous contribuez à l'équipement du centre de formation pour mères célibataires."
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-12">
      {/* Headline */}
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
          {tx(lang,
            "Dona desde 50€ reales. El resto lo pone Hacienda.",
            "Donnez à partir de 50€ réels. Le reste, c'est le fisc."
          )}
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          {tx(lang,
            "Como autónomo puedes deducirte hasta el 80% de tus primeros 250€ en la declaración de la renta. La solidaridad nunca ha tenido tanto sentido.",
            "En tant qu'indépendant, vous pouvez déduire jusqu'à 80% de vos 250 premiers euros dans votre déclaration. La solidarité n'a jamais eu autant de sens."
          )}
        </p>
      </div>

      {/* Number cards */}
      <div className="grid grid-cols-3 gap-4">
        <NumberCard
          value="80%"
          label={tx(lang, "Deducción en IRPF sobre los primeros 250€", "Déduction IRPF sur les 250 premiers €")}
        />
        <NumberCard
          value="200€"
          label={tx(lang, "Devuelve Hacienda por cada 250€ donados — tú solo pones 50€", "Remboursés par le fisc pour 250€ donnés — vous ne payez que 50€")}
        />
        <NumberCard
          value="40-45%"
          label={tx(lang, "Deducción sobre el resto si superas 250€", "Déduction sur le reste au-delà de 250€")}
        />
      </div>

      {/* Calculator */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <p className="font-bold text-gray-900 mb-1">
          {tx(lang, "Calcula tu coste real", "Calculez votre coût réel")}
        </p>
        <p className="text-sm text-gray-400 mb-5">
          {tx(lang,
            "Mueve el slider para ver cuánto te cuesta de verdad.",
            "Déplacez le curseur pour voir votre coût réel."
          )}
        </p>

        <div className="flex items-center gap-4 mb-6">
          <input
            type="range"
            min={50}
            max={1500}
            step={10}
            value={donacionAnual}
            onChange={(e) => setDonacionAnual(Number(e.target.value))}
            className="flex-1 accent-primary-800"
          />
          <span className="font-bold text-primary-800 text-lg w-24 text-right">
            {donacionAnual}€/{tx(lang, "año", "an")}
          </span>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 text-center">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">{tx(lang, "Donas al año", "Vous donnez par an")}</p>
            <p className="text-xl font-extrabold text-gray-700">{fmt(donacionAnual)} €</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">{tx(lang, "Hacienda devuelve", "Le fisc rend")}</p>
            <p className="text-xl font-extrabold text-primary-800">{fmt(devuelve)} €</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">{tx(lang, "Tu coste real", "Votre coût réel")}</p>
            <p className="text-xl font-extrabold text-accent">{fmt(costeMes)} €/{tx(lang, "mes", "mois")}</p>
          </div>
        </div>

        <div className="mt-4 bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-sm text-primary-900">
          ✦ {impactText()}
        </div>

        <p className="text-xs text-gray-400 mt-3 leading-relaxed">
          {tx(lang,
            "* Cálculo orientativo para territorio común. En País Vasco y Navarra aplican regímenes forales propios. El ahorro exacto depende de tu tipo marginal de IRPF.",
            "* Calcul indicatif pour le territoire commun espagnol. Le montant exact dépend de votre taux marginal d'imposition."
          )}
        </p>
      </div>

      {/* Steps */}
      <div>
        <h3 className="font-bold text-gray-900 mb-5 text-lg">
          {tx(lang, "Cómo funciona", "Comment ça marche")}
        </h3>
        <div className="space-y-5">
          <Step
            n={1}
            title={tx(lang, "Eliges tu aportación", "Vous choisissez votre contribution")}
            desc={tx(lang,
              "Puntual o mensual, desde lo que puedas. Sin permanencia.",
              "Ponctuelle ou mensuelle, selon vos moyens. Sans engagement."
            )}
          />
          <Step
            n={2}
            title={tx(lang, "Recibes el certificado", "Vous recevez le reçu fiscal")}
            desc={tx(lang,
              "La fundación te envía el certificado de donativo que necesitas para la deducción.",
              "La fondation vous envoie le reçu fiscal nécessaire à la déduction."
            )}
          />
          <Step
            n={3}
            title={tx(lang, "Tu gestor lo aplica en la renta", "Votre comptable l'applique")}
            desc={tx(lang,
              "En la casilla de donativos a entidades de la Ley 49/2002. Sin complicaciones.",
              "Dans la case dons aux entités de la loi 49/2002. Sans complication."
            )}
          />
          <Step
            n={4}
            title={tx(lang, "Hacienda te devuelve hasta el 80%", "Le fisc vous rembourse jusqu'à 80%")}
            desc={tx(lang,
              "Lo ves en tu próxima declaración. El impacto, en cambio, es el 100%.",
              "Vous le voyez dans votre prochaine déclaration. L'impact, lui, est de 100%."
            )}
          />
        </div>
      </div>

      {/* Levels */}
      <div>
        <h3 className="font-bold text-gray-900 mb-5 text-lg">
          {tx(lang, "Elige tu nivel de colaboración", "Choisissez votre niveau")}
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <LevelCard
            color="light"
            title={tx(lang, "Amigo de Benín", "Ami du Bénin")}
            price={tx(lang, "~10€/mes reales (≈16€ brutos)", "~10€/mois réels (≈16€ bruts)")}
            items={[tx(lang,
              "Alimentación mensual de las aves de la granja avícola",
              "Alimentation mensuelle des volailles de la ferme avicole"
            )]}
          />
          <LevelCard
            color="medium"
            title={tx(lang, "Padrino del rebaño", "Parrain du troupeau")}
            price={tx(lang, "~25€/mes reales (≈40€ brutos)", "~25€/mois réels (≈40€ bruts)")}
            items={[tx(lang,
              "Ayuda veterinaria para el rebaño de ovejas",
              "Aide vétérinaire pour le troupeau de brebis"
            )]}
          />
          <LevelCard
            color="dark"
            title={tx(lang, "Colaborador activo", "Collaborateur actif")}
            price={tx(lang, "~50€/mes reales (≈80€ brutos)", "~50€/mois réels (≈80€ bruts)")}
            items={[tx(lang,
              "Maquinaria y equipamiento para el centro de formación de madres solteras",
              "Machines et équipements pour le centre de formation des mères célibataires"
            )]}
          />
        </div>
        <p className="text-xs text-gray-400 mt-3">
          {tx(lang,
            "\"Brutos\" = lo que sale de tu cuenta. \"Reales\" = coste tras la devolución de IRPF. Cálculos orientativos.",
            "\"Bruts\" = ce qui sort de votre compte. \"Réels\" = coût après remboursement fiscal. Calculs indicatifs."
          )}
        </p>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          href={`/${lang}/colabora/`}
          className="inline-block bg-primary-800 text-white font-bold px-8 py-4 rounded-xl hover:bg-primary-700 transition-colors text-base shadow-sm"
        >
          {tx(lang, "Empezar a colaborar ahora →", "Commencer à collaborer maintenant →")}
        </Link>
        <p className="text-xs text-gray-400 mt-3">
          {tx(lang,
            "Sin permanencia · Cancela cuando quieras · Certificado fiscal incluido",
            "Sans engagement · Annulez quand vous voulez · Reçu fiscal inclus"
          )}
        </p>
      </div>
    </div>
  );
}

// ── Tab Empresas ───────────────────────────────────────────────────────────

function TabEmpresa({ lang, onContactClick }: { lang: Lang; onContactClick: () => void }) {
  const viaAItems = lang === 'es'
    ? [
        "Sin contraprestación directa a cambio.",
        "Deducción del 40% (1er año) o 50% (fidelizada) sobre la cuota del IS.",
        "Límite: 15% de la base imponible. Exceso arrastrable 10 años.",
        "Requiere: certificado oficial emitido por la fundación.",
      ]
    : [
        "Sans contrepartie directe.",
        "Déduction de 40% (1ère année) ou 50% (fidélisée) sur la quote-part IS.",
        "Limite : 15% de la base imposable. Excédent reportable 10 ans.",
        "Nécessite : reçu officiel émis par la fondation.",
      ];

  const viaBItems = lang === 'es'
    ? [
        "La fundación difunde el nombre y logo de tu empresa.",
        "Se registra como gasto deducible de publicidad en el IS.",
        "Sin límite porcentual sobre la base imponible.",
        "Requiere: contrato de colaboración firmado por ambas partes.",
        "Consulta con tu asesor fiscal para aplicarlo correctamente.",
      ]
    : [
        "La fondation diffuse le nom et le logo de votre entreprise.",
        "Comptabilisé comme charge de publicité déductible sur l'IS.",
        "Sans limite en pourcentage de la base imposable.",
        "Nécessite : contrat de collaboration signé par les deux parties.",
        "Consultez votre conseiller fiscal pour l'appliquer correctement.",
      ];

  const whatYouGet = lang === 'es'
    ? [
        { icon: "🌐", title: "Visibilidad", desc: "Logo en la sección \"Empresas colaboradoras\" de la web, mención en RRSS y newsletter." },
        { icon: "🏅", title: "Sello digital", desc: "Certificación \"Empresa colaboradora\" para usar en tu web, firma de email y propuestas comerciales." },
        { icon: "📊", title: "RSC", desc: "Aportación cuantificable para informes de sostenibilidad. Diferenciación real en licitaciones." },
        { icon: "📄", title: "Certificado fiscal", desc: "Documento oficial emitido por la fundación para aplicar la deducción en el ejercicio correspondiente." },
      ]
    : [
        { icon: "🌐", title: "Visibilité", desc: "Logo dans la section \"Entreprises partenaires\" du site, mention sur les réseaux sociaux et la newsletter." },
        { icon: "🏅", title: "Badge numérique", desc: "Certification \"Entreprise partenaire\" à utiliser sur votre site, signature email et propositions commerciales." },
        { icon: "📊", title: "RSE", desc: "Contribution quantifiable pour les rapports de durabilité. Différenciation réelle dans les appels d'offres." },
        { icon: "📄", title: "Reçu fiscal", desc: "Document officiel émis par la fondation pour appliquer la déduction sur l'exercice correspondant." },
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-12">
      {/* Headline */}
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
          {tx(lang,
            "Hacienda financia el 50% de tu colaboración. El otro 50% vale mucho más.",
            "Le fisc finance 50% de votre collaboration. L'autre 50% vaut bien plus."
          )}
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          {tx(lang,
            "Las empresas acogidas a la Ley 49/2002 pueden deducir hasta el 50% de sus donativos directamente en el Impuesto sobre Sociedades.",
            "Les entreprises relevant de la loi 49/2002 peuvent déduire jusqu'à 50% de leurs dons directement sur l'impôt sur les sociétés."
          )}
        </p>
      </div>

      {/* Number cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <NumberCard value="50%" label={tx(lang, "Deducción IS — empresas fidelizadas (3 años)", "Déduction IS — fidélisées (3 ans)")} />
        <NumberCard value="40%" label={tx(lang, "Deducción IS — primer año o sin fidelización", "Déduction IS — première année")} />
        <NumberCard value="art. 25" label={tx(lang, "Convenio de colaboración — gasto deducible en IS", "Convention de collaboration — charge déductible")} />
        <NumberCard value="10 años" label={tx(lang, "Plazo de arrastre del exceso de deducción no aplicado", "Report du solde de déduction non utilisé")} />
      </div>

      {/* Dos vías */}
      <div>
        <h3 className="font-bold text-gray-900 mb-5 text-lg">
          {tx(lang, "Dos vías para colaborar", "Deux façons de collaborer")}
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-primary-800 text-white px-4 py-3 font-bold text-sm">
              {tx(lang, "Vía A — Donativo (deducción en cuota IS)", "Voie A — Don (déduction sur quote-part IS)")}
            </div>
            <div className="bg-white p-4 space-y-1.5">
              {viaAItems.map((item, i) => (
                <p key={i} className="text-xs text-gray-500 flex gap-2">
                  <span className="text-primary-700 font-bold flex-shrink-0">→</span>
                  {item}
                </p>
              ))}
            </div>
          </div>
          <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-accent text-white px-4 py-3 font-bold text-sm">
              {tx(lang, "Vía B — Convenio de colaboración (art. 25)", "Voie B — Convention de collaboration (art. 25)")}
            </div>
            <div className="bg-white p-4 space-y-1.5">
              {viaBItems.map((item, i) => (
                <p key={i} className="text-xs text-gray-500 flex gap-2">
                  <span className="text-accent font-bold flex-shrink-0">→</span>
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ejemplo */}
      <div>
        <h3 className="font-bold text-gray-900 mb-2 text-lg">
          {tx(lang, "Ejemplo práctico", "Exemple pratique")}
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          {tx(lang,
            "Empresa con 500.000€ de base imponible (IS al 25%) que colabora con 5.000€/año.",
            "Entreprise avec 500 000€ de base imposable (IS à 25%) qui collabore à hauteur de 5 000€/an."
          )}
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Receipt
            title={tx(lang, "Opción A — Donativo fidelizado (3er año)", "Option A — Don fidélisé (3e année)")}
            rows={[
              { label: tx(lang, "Importe donado", "Montant du don"), value: "5.000,00 €" },
              { label: tx(lang, "Deducción IS (50%)", "Déduction IS (50%)"), value: "− 2.500,00 €" },
            ]}
            total={tx(lang, "Coste real neto", "Coût réel net")}
            totalValue="2.500,00 €"
          />
          <Receipt
            title={tx(lang, "Opción B — Convenio de colaboración", "Option B — Convention de collaboration")}
            rows={[
              { label: tx(lang, "Importe aportado", "Montant apporté"), value: "5.000,00 €" },
              { label: tx(lang, "Ahorro IS (gasto al 25%)", "Économie IS (charge à 25%)"), value: "− 1.250,00 €" },
            ]}
            total={tx(lang, "Coste real neto", "Coût réel net")}
            totalValue="3.750,00 €"
          />
        </div>
        <p className="text-xs text-gray-400 mt-3">
          {tx(lang,
            "La Vía A es más eficiente fiscalmente. La Vía B ofrece más flexibilidad y visibilidad. Consulta con tu asesor cuál se adapta mejor.",
            "La Voie A est plus efficace fiscalement. La Voie B offre plus de flexibilité et de visibilité. Consultez votre conseiller pour choisir."
          )}
        </p>
      </div>

      {/* Qué obtiene */}
      <div>
        <h3 className="font-bold text-gray-900 mb-4 text-lg">
          {tx(lang, "Qué obtiene tu empresa", "Ce que votre entreprise obtient")}
        </h3>
        <div className="space-y-3">
          {whatYouGet.map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-4 items-start bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <span className="text-2xl flex-shrink-0">{icon}</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{title}</p>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Niveles */}
      <div>
        <h3 className="font-bold text-gray-900 mb-5 text-lg">
          {tx(lang, "Niveles de patrocinio", "Niveaux de mécénat")}
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <LevelCard
            color="light"
            title={tx(lang, "Colaborador ganadero", "Collaborateur éleveur")}
            price={tx(lang, "Desde 500€/año", "À partir de 500€/an")}
            items={lang === 'es'
              ? [
                  "Adquisición de varias cabezas de ganado para el nuevo rebaño",
                  "Logo en web + mención en RRSS trimestral",
                  "Certificado fiscal anual",
                  "Sello digital de empresa colaboradora",
                ]
              : [
                  "Acquisition de plusieurs têtes de bétail pour le nouveau troupeau",
                  "Logo sur le site + mention trimestrielle sur les réseaux",
                  "Reçu fiscal annuel",
                  "Badge numérique d'entreprise partenaire",
                ]
            }
          />
          <LevelCard
            color="medium"
            title={tx(lang, "Padrino del rebaño", "Parrain du troupeau")}
            price={tx(lang, "Desde 2.000€/año", "À partir de 2.000€/an")}
            items={lang === 'es'
              ? [
                  "Construcción y equipamiento del aprisco del nuevo rebaño de ovejas",
                  "Logo y nombre en la web como empresa colaboradora",
                  "Sello digital + certificado fiscal",
                  "Actualización semestral del estado del proyecto",
                ]
              : [
                  "Construction et équipement de la bergerie du nouveau troupeau",
                  "Logo et nom sur le site comme entreprise partenaire",
                  "Badge numérique + reçu fiscal",
                  "Mise à jour semestrielle sur l'état du projet",
                ]
            }
          />
          <LevelCard
            color="dark"
            title={tx(lang, "Socio estratégico", "Partenaire stratégique")}
            price={tx(lang, "Desde 5.000€/año", "À partir de 5.000€/an")}
            items={lang === 'es'
              ? [
                  "Ayuda de peso para el lanzamiento de nuevos proyectos y la sustentación de los existentes",
                  "Logo y mención en web, memorias anuales y comunicaciones de la fundación",
                  "Certificado fiscal + reunión anual de seguimiento",
                  "Posibilidad de visita al terreno (Benín)",
                ]
              : [
                  "Soutien majeur au lancement de nouveaux projets et à la pérennisation des existants",
                  "Logo et mention sur le site, les rapports annuels et les communications de la fondation",
                  "Reçu fiscal + réunion annuelle de suivi",
                  "Possibilité de visite sur le terrain (Bénin)",
                ]
            }
          />
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <button
          onClick={onContactClick}
          className="inline-block bg-primary-800 text-white font-bold px-8 py-4 rounded-xl hover:bg-primary-700 transition-colors text-base shadow-sm cursor-pointer"
        >
          {tx(lang, "Contactar con la fundación →", "Contacter la fondation →")}
        </button>
        <p className="text-xs text-gray-400 mt-3">
          {tx(lang,
            "Te respondemos en menos de 48h con una propuesta adaptada a tu empresa.",
            "Nous vous répondons en moins de 48h avec une proposition adaptée."
          )}
        </p>
      </div>
    </div>
  );
}

// ── Formulario de contacto ─────────────────────────────────────────────────

function ContactForm({ lang, defaultTipo }: { lang: Lang; defaultTipo: Tab }) {
  const [tipo, setTipo] = useState<'autonomo' | 'empresa' | 'indefinido'>(defaultTipo);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [message, setMessage] = useState('');
  const [rgpd, setRgpd] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [website, setWebsite] = useState('');
  const [_t, setT] = useState('');

  // Record page load time — backend rejects instant bot submissions
  useEffect(() => {
    setT(btoa(Date.now().toString()));
  }, []);

  useEffect(() => {
    setTipo(defaultTipo);
  }, [defaultTipo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rgpd) return;
    setStatus('sending');
    try {
      const tipoLabel =
        tipo === 'autonomo'
          ? tx(lang, 'Autónomo', 'Indépendant')
          : tipo === 'empresa'
          ? tx(lang, 'Empresa', 'Entreprise')
          : tx(lang, 'Sin especificar', 'Non précisé');

      const subject = lang === 'es'
        ? `Colaboración empresarial — ${tipoLabel}${empresa ? ` (${empresa})` : ''}`
        : `Collaboration — ${tipoLabel}${empresa ? ` (${empresa})` : ''}`;

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fundacionluzdebenin.org';
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          subject,
          message: message || tx(lang, '(Sin mensaje adicional)', '(Sans message supplémentaire)'),
          lang,
          website,
          _t,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus('ok');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'ok') {
    return (
      <div className="text-center py-10">
        <p className="text-4xl mb-4">✅</p>
        <p className="font-bold text-gray-900 text-lg mb-2">
          {tx(lang, `Gracias, ${name}.`, `Merci, ${name}.`)}
        </p>
        <p className="text-gray-500 text-sm">
          {tx(lang,
            "Te contactamos en menos de 48 horas con una propuesta adaptada a tu situación.",
            "Nous vous contactons dans moins de 48 heures avec une proposition adaptée."
          )}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Anti-spam: honeypot + form load timestamp (hidden from users) */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }}
      />
      <input type="hidden" name="_t" value={_t} />
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {tx(lang, "Nombre y apellidos", "Nom et prénom")} *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {tx(lang, "Soy", "Je suis")} *
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as typeof tipo)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800 bg-white"
          >
            <option value="autonomo">{tx(lang, "Autónomo / Freelance", "Indépendant / Freelance")}</option>
            <option value="empresa">{tx(lang, "Empresa", "Entreprise")}</option>
            <option value="indefinido">{tx(lang, "No estoy seguro/a", "Je ne suis pas sûr(e)")}</option>
          </select>
        </div>
        {tipo === 'empresa' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {tx(lang, "Nombre de la empresa", "Nom de l'entreprise")}
            </label>
            <input
              type="text"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {tx(lang, "¿Qué te ha llamado la atención?", "Qu'est-ce qui vous a intéressé ?")}
        </label>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={tx(lang, "(Opcional)", "(Facultatif)")}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800 resize-none"
        />
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          required
          checked={rgpd}
          onChange={(e) => setRgpd(e.target.checked)}
          className="mt-0.5 accent-primary-800"
        />
        <span className="text-xs text-gray-500 leading-relaxed">
          {tx(lang,
            "He leído y acepto la Política de Privacidad. Mis datos serán usados exclusivamente para responder a esta consulta.",
            "J'ai lu et j'accepte la Politique de confidentialité. Mes données seront utilisées uniquement pour répondre à cette demande."
          )}
        </span>
      </label>

      {status === 'error' && (
        <p className="text-sm text-red-600">
          {tx(lang,
            "Ha habido un error. Escríbenos directamente a colabora@fundacionluzdebenin.org",
            "Une erreur s'est produite. Écrivez-nous à colabora@fundacionluzdebenin.org"
          )}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending' || !rgpd}
        className="w-full bg-primary-800 text-white font-bold py-3 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'sending'
          ? tx(lang, "Enviando…", "Envoi en cours…")
          : tx(lang, "Enviar consulta →", "Envoyer la demande →")}
      </button>

      <p className="text-xs text-gray-400 text-center">
        {tx(lang, "¿Prefieres el contacto directo? ", "Vous préférez le contact direct ? ")}
        <a href="mailto:colabora@fundacionluzdebenin.org" className="text-primary-800 hover:underline">
          colabora@fundacionluzdebenin.org
        </a>
      </p>
    </form>
  );
}

// ── Inner (usa useSearchParams — necesita Suspense en el padre) ────────────

function Inner({ lang }: { lang: Lang }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialTab: Tab = searchParams.get('tipo') === 'empresa' ? 'empresa' : 'autonomo';
  const [tab, setTab] = useState<Tab>(initialTab);

  const formRef = useRef<HTMLElement>(null);
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tipo', newTab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const whatWeDo = lang === 'es'
    ? [
        { icon: "🐔", title: "Granja avícola", desc: "2.500 gallinas, +300.000 huevos al año. Provee de alimento a los orfanatos y genera ingresos para la fundación." },
        { icon: "🐑", title: "Rebaño de ovejas", desc: "Nuevo proyecto en lanzamiento. Generará lana, carne y leche para la comunidad con autonomía económica real." },
        { icon: "🏠", title: "4 orfanatos", desc: "Apoyamos 4 orfanatos en la región de Cotonou con alimentación, educación, ropa y atención médica." },
        { icon: "👩", title: "Centro de formación de madres", desc: "En construcción. Formación profesional para madres solteras embarazadas para que alcancen la autonomía." },
        { icon: "🌿", title: "Residencia y enfermería", desc: "3 viviendas que hacen de albergue para trabajadores y donde una enfermera atiende a los niños." },
      ]
    : [
        { icon: "🐔", title: "Ferme avicole", desc: "2 500 poules, +300 000 œufs par an. Fournit des aliments aux orphelinats et génère des revenus pour la fondation." },
        { icon: "🐑", title: "Troupeau de brebis", desc: "Nouveau projet en cours de lancement. Générera laine, viande et lait pour la communauté rurale." },
        { icon: "🏠", title: "4 orphelinats", desc: "Nous soutenons 4 orphelinats dans la région de Cotonou : alimentation, éducation, vêtements et soins médicaux." },
        { icon: "👩", title: "Centre de formation", desc: "En construction. Formation professionnelle pour mères célibataires enceintes pour leur autonomie économique." },
        { icon: "🌿", title: "Résidence et infirmerie", desc: "3 logements pour les travailleurs et une infirmière qui assure le suivi des enfants des orphelinats." },
      ];

  return (
    <div>
      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex justify-center">
          <div className="inline-flex rounded-lg bg-gray-100 p-1 gap-1">
            {(['autonomo', 'empresa'] as Tab[]).map((t) => {
              const label = t === 'autonomo'
                ? tx(lang, "Soy autónomo", "Je suis indépendant")
                : tx(lang, "Soy empresa", "Je suis une entreprise");
              const active = tab === t;
              return (
                <button
                  key={t}
                  onClick={() => handleTabChange(t)}
                  className={`px-6 py-2 rounded-md text-sm font-semibold transition-all duration-150 ${
                    active
                      ? 'bg-white text-primary-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="bg-bg">
        {tab === 'autonomo'
          ? <TabAutonomo lang={lang} />
          : <TabEmpresa lang={lang} onContactClick={scrollToForm} />
        }
      </div>

      {/* What we do */}
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-xl font-extrabold text-gray-900 mb-8 text-center">
            {tx(lang, "En qué trabajamos", "Ce sur quoi nous travaillons")}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {whatWeDo.map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-4 items-start bg-gray-50 border border-gray-100 rounded-xl p-4">
                <span className="text-2xl flex-shrink-0">{icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transparency */}
      <section className="bg-primary-50 border-y border-primary-100 py-10">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-primary-800 mb-1">
            {tx(lang, "Transparencia y seriedad", "Transparence et sérieux")}
          </p>
          <p className="text-gray-600 text-sm leading-relaxed max-w-xl mx-auto">
            {tx(lang,
              "Estamos inscritos en el Registro de Fundaciones. Nuestras cuentas son públicas. Cada euro aportado queda documentado y destinado íntegramente a los proyectos.",
              "Nous sommes inscrits au Registre des Fondations. Nos comptes sont publics. Chaque euro apporté est documenté et intégralement destiné aux projets."
            )}
          </p>
          <p className="text-xs text-primary-700 mt-3 font-medium">
            {tx(lang,
              "Marco fiscal acreditado · Ley 49/2002 · Art. 25",
              "Cadre fiscal accrédité · Loi 49/2002 · Art. 25"
            )}
          </p>
        </div>
      </section>

      {/* Contact form */}
      <section className="bg-white py-16" ref={formRef}>
        <div className="max-w-xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
              {tx(lang, "Cuéntanos tu situación", "Parlez-nous de votre situation")}
            </h2>
            <p className="text-gray-500 text-sm">
              {tx(lang,
                "Te respondemos en menos de 48 horas con una propuesta concreta y sin compromiso.",
                "Nous vous répondons en moins de 48 heures avec une proposition concrète et sans engagement."
              )}
            </p>
          </div>
          <ContactForm lang={lang} defaultTipo={tab} />
        </div>
      </section>
    </div>
  );
}

// ── Export ─────────────────────────────────────────────────────────────────

export default function ColaboraEmpresasClient({ lang }: { lang: Lang }) {
  return (
    <Suspense fallback={<div className="h-16 bg-white border-b border-gray-200" />}>
      <Inner lang={lang} />
    </Suspense>
  );
}
