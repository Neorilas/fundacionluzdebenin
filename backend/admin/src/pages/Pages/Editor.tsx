import { useEffect, useState } from 'react';
import api from '../../api';
import IconPicker from '../../components/IconPicker';

interface Section {
  id: string;
  page: string;
  section: string;
  key: string;
  valueEs: string;
  valueFr: string;
}

const PAGES = ['home', 'que-hacemos', 'quienes-somos', 'colabora', 'contacto'];
const PAGE_LABELS: Record<string, string> = {
  'home': '🏠 Inicio',
  'que-hacemos': '💡 Qué Hacemos',
  'quienes-somos': '👥 Quiénes Somos',
  'colabora': '❤️ Colabora',
  'contacto': '📞 Contacto',
};

const VALID_SECTIONS: Record<string, Record<string, string[]>> = {
  'home': {
    'hero': ['quote', 'quoteRef', 'tagline', 'stat1Value', 'stat1Label', 'stat2Value', 'stat2Label', 'stat3Value', 'stat3Label'],
    'mission': ['title', 'text'],
    'pillar1': ['icon', 'title', 'desc'],
    'pillar2': ['icon', 'title', 'desc'],
    'pillar3': ['icon', 'title', 'desc'],
    'stat1': ['icon', 'value', 'label'],
    'stat2': ['icon', 'value', 'label'],
    'stat3': ['icon', 'value', 'label'],
    'stat4': ['icon', 'value', 'label'],
    'donationCta': ['sectionTitle', 'bottomText'],
    'impact1': ['amount', 'icon', 'text'],
    'impact2': ['amount', 'icon', 'text'],
    'impact3': ['amount', 'icon', 'text'],
    'impact4': ['amount', 'icon', 'text'],
  },
  'que-hacemos': {
    'hero': ['title', 'subtitle'],
    'education': ['icon', 'title', 'text'],
    'health': ['icon', 'title', 'text'],
    'development': ['icon', 'title', 'text'],
    'methodology': ['step1', 'step2', 'step3', 'step4'],
  },
  'quienes-somos': {
    'hero': ['title', 'subtitle'],
    'history': ['title', 'text'],
    'timeline': ['data'],
    'value1': ['icon', 'title', 'desc'],
    'value2': ['icon', 'title', 'desc'],
    'value3': ['icon', 'title', 'desc'],
    'value4': ['icon', 'title', 'desc'],
  },
  'colabora': {
    'hero': ['title', 'subtitle'],
    'donation': ['title', 'text'],
    'impact': ['10eur', '30eur', '100eur', '500eur'],
    'volunteer': ['title', 'desc'],
    'companies': ['title', 'desc'],
    'spread': ['title', 'desc'],
  },
  'contacto': {
    'hero': ['title', 'subtitle'],
  },
};

const SECTION_LABELS: Record<string, string> = {
  'hero': '🖼️ Cabecera',
  'mission': '🎯 Bloque de Misión',
  'pillar1': '1️⃣ Pilar 1',
  'pillar2': '2️⃣ Pilar 2',
  'pillar3': '3️⃣ Pilar 3',
  'stat1': '📊 Estadística 1',
  'stat2': '📊 Estadística 2',
  'stat3': '📊 Estadística 3',
  'stat4': '📊 Estadística 4',
  'donationCta': '💝 CTA de Donación',
  'impact1': '💰 Impacto — 10€',
  'impact2': '💰 Impacto — 30€',
  'impact3': '💰 Impacto — 100€',
  'impact4': '💰 Impacto — 500€',
  'education': '📚 Pilar — Educación',
  'health': '🏥 Pilar — Salud',
  'development': '🌱 Pilar — Desarrollo',
  'history': '📖 Historia de la Fundación',
  'donation': '🏦 Donación por Transferencia',
  'impact': '✨ Impacto de tu Donación',
  'methodology': '🔄 Metodología (4 pasos)',
  'timeline': '📅 Timeline — Hitos históricos',
  'value1': '💎 Valor 1',
  'value2': '💎 Valor 2',
  'value3': '💎 Valor 3',
  'value4': '💎 Valor 4',
  'volunteer': '🙋 Otras formas — Voluntariado',
  'companies': '🏢 Otras formas — Empresas',
  'spread': '📣 Otras formas — Difunde',
};

const KEY_LABELS: Record<string, string> = {
  'icon': 'Icono (emoji)',
  'title': 'Título',
  'subtitle': 'Subtítulo',
  'text': 'Texto',
  'desc': 'Descripción',
  'quote': 'Cita bíblica',
  'quoteRef': 'Referencia bíblica',
  'tagline': 'Eslogan',
  'stat1Value': 'Stat 1 — Número',
  'stat1Label': 'Stat 1 — Etiqueta',
  'stat2Value': 'Stat 2 — Número',
  'stat2Label': 'Stat 2 — Etiqueta',
  'stat3Value': 'Stat 3 — Número',
  'stat3Label': 'Stat 3 — Etiqueta',
  'value': 'Número / Valor',
  'label': 'Etiqueta',
  'sectionTitle': 'Título de la sección',
  'bottomText': 'Texto inferior',
  'amount': 'Importe (ej: 10€)',
  '10eur': 'Con 10 € puedes...',
  '30eur': 'Con 30 € puedes...',
  '100eur': 'Con 100 € puedes...',
  '500eur': 'Con 500 € puedes...',
  'data': 'Hitos',
  'step1': 'Paso 1',
  'step2': 'Paso 2',
  'step3': 'Paso 3',
  'step4': 'Paso 4',
};

const IS_LONG: Set<string> = new Set(['text', 'desc', 'quote', 'tagline', 'bottomText', '10eur', '30eur', '100eur', '500eur']);
const IS_NUMBERS_ONLY: Set<string> = new Set(['stat1Value', 'stat2Value', 'stat3Value', 'value', 'amount']);

const PAGE_NOTES: Record<string, string> = {
  'home': 'Edita la cita bíblica, eslogan, estadísticas, pilares de misión, contadores y bloque de donación.',
  'que-hacemos': 'Edita la cabecera, los tres pilares y los 4 pasos de metodología.',
  'quienes-somos': 'Edita la cabecera, historia, los hitos del timeline (añade/elimina libremente) y los 4 valores.',
  'colabora': 'Edita cabecera, transferencia bancaria, impactos y las tarjetas de otras formas (voluntariado, empresas, difundir).',
  'contacto': 'Edita el título y subtítulo de la cabecera de la página de contacto.',
};

// ─── Timeline List Editor ─────────────────────────────────────────────────────

interface TimelineItem { year: string; eventEs: string; eventFr: string; }

function parseTimeline(es: string, fr: string): TimelineItem[] {
  try {
    const esArr: { year: string; event: string }[] = JSON.parse(es || '[]');
    const frArr: { year: string; event: string }[] = JSON.parse(fr || '[]');
    return esArr.map((item, i) => ({
      year: item.year,
      eventEs: item.event,
      eventFr: frArr[i]?.event || '',
    }));
  } catch { return []; }
}

function serializeTimeline(items: TimelineItem[]) {
  const es = JSON.stringify(items.map(i => ({ year: i.year, event: i.eventEs })));
  const fr = JSON.stringify(items.map(i => ({ year: i.year, event: i.eventFr })));
  return { es, fr };
}

function TimelineListEditor({ valueEs, valueFr, onChange }: {
  valueEs: string;
  valueFr: string;
  onChange: (es: string, fr: string) => void;
}) {
  const [translatingIdx, setTranslatingIdx] = useState<number | null>(null);
  const items = parseTimeline(valueEs, valueFr);

  const update = (next: TimelineItem[]) => {
    const { es, fr } = serializeTimeline(next);
    onChange(es, fr);
  };

  const addItem = () => update([...items, { year: '', eventEs: '', eventFr: '' }]);
  const removeItem = (i: number) => update(items.filter((_, idx) => idx !== i));
  const setField = (i: number, field: keyof TimelineItem, val: string) =>
    update(items.map((it, idx) => idx === i ? { ...it, [field]: val } : it));

  const translateItem = async (i: number) => {
    if (!items[i].eventEs.trim()) return;
    setTranslatingIdx(i);
    try {
      const r = await api.post('/admin/translate', { text: items[i].eventEs, from: 'es', to: 'fr' });
      setField(i, 'eventFr', r.data.translatedText || items[i].eventEs);
    } finally { setTranslatingIdx(null); }
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 shrink-0">Año</span>
            <input
              type="text"
              value={item.year}
              onChange={e => setField(i, 'year', e.target.value)}
              placeholder="2024"
              className="w-24 border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-800"
            />
            <button
              type="button"
              onClick={() => translateItem(i)}
              disabled={translatingIdx === i || !item.eventEs.trim()}
              className="ml-auto text-xs text-blue-500 hover:text-blue-700 disabled:opacity-30 flex items-center gap-1"
            >
              {translatingIdx === i
                ? <span className="inline-block w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
                : '🌐'
              }
              ES→FR
            </button>
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
            >
              ✕ Eliminar
            </button>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-400 mb-1">🇪🇸 Español</div>
            <textarea
              value={item.eventEs}
              onChange={e => setField(i, 'eventEs', e.target.value)}
              rows={2}
              placeholder="Descripción del hito en español"
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-800"
            />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-400 mb-1">🇫🇷 Français</div>
            <textarea
              value={item.eventFr}
              onChange={e => setField(i, 'eventFr', e.target.value)}
              rows={2}
              placeholder="Description du jalon en français"
              className={`w-full border rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-800 ${
                !item.eventFr.trim() ? 'border-amber-200 bg-amber-50' : 'border-gray-300'
              }`}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg py-2.5 text-sm text-gray-500 hover:border-primary-800 hover:text-primary-800 transition-colors"
      >
        + Añadir hito
      </button>
    </div>
  );
}

// ─── Section Card ────────────────────────────────────────────────────────────

interface SectionCardProps {
  sectionKey: string;
  items: Section[];
  edits: Record<string, { valueEs: string; valueFr: string }>;
  onEdit: (id: string, field: 'valueEs' | 'valueFr', value: string) => void;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
}

function SectionCard({ sectionKey, items, edits, onEdit, onSave, saving, saved }: SectionCardProps) {
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [translatingAll, setTranslatingAll] = useState(false);

  const translateField = async (id: string, valueEs: string) => {
    if (!valueEs.trim()) return;
    setTranslatingId(id);
    try {
      const r = await api.post('/admin/translate', { text: valueEs, from: 'es', to: 'fr' });
      onEdit(id, 'valueFr', r.data.translatedText || valueEs);
    } finally {
      setTranslatingId(null);
    }
  };

  const translateAll = async () => {
    setTranslatingAll(true);
    try {
      for (const item of items) {
        if (item.key === 'icon' || item.key === 'data' || IS_NUMBERS_ONLY.has(item.key)) continue;
        const valueEs = edits[item.id]?.valueEs || '';
        if (!valueEs.trim()) continue;
        const r = await api.post('/admin/translate', { text: valueEs, from: 'es', to: 'fr' });
        onEdit(item.id, 'valueFr', r.data.translatedText || valueEs);
      }
    } finally {
      setTranslatingAll(false);
    }
  };

  const hasMissingFr = items.some(i =>
    i.key !== 'icon' && i.key !== 'data' && !IS_NUMBERS_ONLY.has(i.key) && !(edits[i.id]?.valueFr?.trim())
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-800 text-sm">{SECTION_LABELS[sectionKey] || sectionKey}</h3>
          {hasMissingFr && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Falta FR</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={translateAll}
            disabled={translatingAll}
            title="Traducir todos los campos al francés"
            className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-40 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
          >
            {translatingAll
              ? <span className="inline-block w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin" />
              : '🌐'
            }
            {translatingAll ? 'Traduciendo…' : 'Traducir →FR'}
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-primary-800 text-white hover:bg-primary-900 disabled:opacity-50'
            }`}
          >
            {saving ? 'Guardando…' : saved ? '✓ Guardado' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="p-5 space-y-5">
        {items.map(item => (
          <div key={item.id}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                {KEY_LABELS[item.key] || item.key}
              </label>
              {item.key !== 'icon' && item.key !== 'data' && !IS_NUMBERS_ONLY.has(item.key) && (
                <button
                  type="button"
                  onClick={() => translateField(item.id, edits[item.id]?.valueEs || '')}
                  disabled={translatingId === item.id || !edits[item.id]?.valueEs?.trim()}
                  className="text-xs text-blue-500 hover:text-blue-700 disabled:opacity-30 flex items-center gap-1"
                >
                  {translatingId === item.id
                    ? <span className="inline-block w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
                    : '🌐'
                  }
                  ES→FR
                </button>
              )}
            </div>

            {item.key === 'data' ? (
              <TimelineListEditor
                valueEs={edits[item.id]?.valueEs || '[]'}
                valueFr={edits[item.id]?.valueFr || '[]'}
                onChange={(es, fr) => {
                  onEdit(item.id, 'valueEs', es);
                  onEdit(item.id, 'valueFr', fr);
                }}
              />
            ) : item.key === 'icon' ? (
              <div className="flex items-center gap-3">
                <IconPicker
                  value={edits[item.id]?.valueEs || ''}
                  onChange={(emoji) => {
                    onEdit(item.id, 'valueEs', emoji);
                    onEdit(item.id, 'valueFr', emoji);
                  }}
                />
                <span className="text-xs text-gray-400">Se aplica en los dos idiomas</span>
              </div>
            ) : IS_NUMBERS_ONLY.has(item.key) ? (
              // Numbers: single field (same value for both langs)
              <input
                type="text"
                value={edits[item.id]?.valueEs || ''}
                onChange={e => {
                  onEdit(item.id, 'valueEs', e.target.value);
                  onEdit(item.id, 'valueFr', e.target.value);
                }}
                className="w-48 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
              />
            ) : IS_LONG.has(item.key) ? (
              // Long text: stacked ES then FR
              <div className="space-y-2">
                <div>
                  <div className="text-xs font-medium text-gray-400 mb-1">🇪🇸 Español</div>
                  <textarea
                    value={edits[item.id]?.valueEs || ''}
                    onChange={e => onEdit(item.id, 'valueEs', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-400 mb-1">🇫🇷 Français</div>
                  <textarea
                    value={edits[item.id]?.valueFr || ''}
                    onChange={e => onEdit(item.id, 'valueFr', e.target.value)}
                    rows={3}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800 ${
                      !edits[item.id]?.valueFr?.trim() ? 'border-amber-200 bg-amber-50' : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>
            ) : (
              // Short text: side-by-side
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <div className="text-xs font-medium text-gray-400 mb-1">🇪🇸 Español</div>
                  <input
                    type="text"
                    value={edits[item.id]?.valueEs || ''}
                    onChange={e => onEdit(item.id, 'valueEs', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-400 mb-1">🇫🇷 Français</div>
                  <input
                    type="text"
                    value={edits[item.id]?.valueFr || ''}
                    onChange={e => onEdit(item.id, 'valueFr', e.target.value)}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800 ${
                      !edits[item.id]?.valueFr?.trim() ? 'border-amber-200 bg-amber-50' : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Editor ─────────────────────────────────────────────────────────────

export default function PagesEditor() {
  const [selectedPage, setSelectedPage] = useState('home');
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, { valueEs: string; valueFr: string }>>({});

  const load = (page: string) => {
    setLoading(true);
    api.get(`/admin/pages/${page}`).then(r => {
      setSections(r.data);
      const init: Record<string, { valueEs: string; valueFr: string }> = {};
      for (const s of r.data) init[s.id] = { valueEs: s.valueEs, valueFr: s.valueFr };
      setEdits(init);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(selectedPage); }, [selectedPage]);

  const handleEdit = (id: string, field: 'valueEs' | 'valueFr', value: string) => {
    setEdits(prev => ({ ...prev, [id]: { ...(prev[id] || { valueEs: '', valueFr: '' }), [field]: value } }));
  };

  const handleSaveSection = async (sectionName: string, items: Section[]) => {
    setSaving(sectionName);
    try {
      await Promise.all(items.map(item => api.put(`/admin/pages/${item.id}`, edits[item.id])));
      setSaved(sectionName);
      setTimeout(() => setSaved(null), 2500);
    } catch {
      alert('Error al guardar. Comprueba que has iniciado sesión y vuelve a intentarlo.');
    } finally {
      setSaving(null);
    }
  };

  const validSections = VALID_SECTIONS[selectedPage] || {};
  const filtered = sections.filter(s => validSections[s.section]?.includes(s.key));

  const grouped: Record<string, Section[]> = {};
  for (const s of filtered) {
    if (!grouped[s.section]) grouped[s.section] = [];
    grouped[s.section].push(s);
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Editor de Páginas</h2>

      {/* Page selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {PAGES.map(page => (
          <button
            key={page}
            onClick={() => setSelectedPage(page)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPage === page
                ? 'bg-primary-800 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-800 hover:text-primary-800'
            }`}
          >
            {PAGE_LABELS[page]}
          </button>
        ))}
      </div>

      {/* Note */}
      {PAGE_NOTES[selectedPage] && (
        <div className="mb-5 flex items-start gap-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
          <span className="shrink-0">ℹ️</span>
          <span>{PAGE_NOTES[selectedPage]}</span>
        </div>
      )}

      {/* Legend */}
      <div className="mb-4 flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-2 rounded bg-amber-100 border border-amber-300"></span>
          Campo sin traducción al francés
        </span>
        <span className="flex items-center gap-1">🌐 Traducir →FR</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([sectionKey, items]) => (
            <SectionCard
              key={sectionKey}
              sectionKey={sectionKey}
              items={items}
              edits={edits}
              onEdit={handleEdit}
              onSave={() => handleSaveSection(sectionKey, items)}
              saving={saving === sectionKey}
              saved={saved === sectionKey}
            />
          ))}
        </div>
      )}
    </div>
  );
}
