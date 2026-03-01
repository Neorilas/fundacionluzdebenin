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

const PAGES = ['home', 'que-hacemos', 'quienes-somos', 'colabora'];
const PAGE_LABELS: Record<string, string> = {
  'home': 'Inicio',
  'que-hacemos': 'Qué Hacemos',
  'quienes-somos': 'Quiénes Somos',
  'colabora': 'Colabora',
};

// Secciones y claves que el frontend realmente lee de la API
const VALID_SECTIONS: Record<string, Record<string, string[]>> = {
  'home': {
    'mission': ['title', 'text'],
  },
  'que-hacemos': {
    'hero': ['title', 'subtitle'],
    'education': ['icon', 'title', 'text'],
    'health': ['icon', 'title', 'text'],
    'development': ['icon', 'title', 'text'],
  },
  'quienes-somos': {
    'hero': ['title', 'subtitle'],
    'history': ['title', 'text'],
  },
  'colabora': {
    'hero': ['title', 'subtitle'],
    'donation': ['title', 'text'],
    'impact': ['10eur', '30eur', '100eur', '500eur'],
  },
};

const SECTION_LABELS: Record<string, string> = {
  'hero': 'Cabecera',
  'mission': 'Bloque de Misión',
  'education': 'Pilar — Educación',
  'health': 'Pilar — Salud',
  'development': 'Pilar — Desarrollo',
  'history': 'Historia de la Fundación',
  'donation': 'Donación por Transferencia',
  'impact': 'Impacto de tu Donación',
};

const KEY_LABELS: Record<string, string> = {
  'icon': 'Icono (emoji)',
  'title': 'Título',
  'subtitle': 'Subtítulo',
  'text': 'Texto',
  '10eur': 'Con 10 €',
  '30eur': 'Con 30 €',
  '100eur': 'Con 100 €',
  '500eur': 'Con 500 €',
};

// Aviso sobre contenido fijo en el código para cada página
const PAGE_NOTES: Record<string, string> = {
  'home': 'La cabecera principal y las estadísticas son fijas en el código. Aquí puedes editar el bloque de misión que aparece bajo ellas.',
  'que-hacemos': 'Los pasos de metodología son fijos en el código. Aquí puedes editar la cabecera y los tres pilares de trabajo.',
  'quienes-somos': 'Los hitos del timeline y los valores (Compromiso, Sostenibilidad, Transparencia, Dignidad) son fijos en el código. Aquí puedes editar la cabecera y el texto introductorio de historia.',
  'colabora': 'Las tarjetas de voluntariado, empresas y difusión son fijas en el código. Aquí puedes editar la cabecera, la sección de donación bancaria y los textos de impacto.',
};

export default function PagesEditor() {
  const [selectedPage, setSelectedPage] = useState('home');
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [editLang, setEditLang] = useState<'es' | 'fr'>('es');
  const [edits, setEdits] = useState<Record<string, { valueEs: string; valueFr: string }>>({});

  const load = (page: string) => {
    setLoading(true);
    api.get(`/admin/pages/${page}`).then(r => {
      setSections(r.data);
      const initEdits: Record<string, { valueEs: string; valueFr: string }> = {};
      for (const s of r.data) {
        initEdits[s.id] = { valueEs: s.valueEs, valueFr: s.valueFr };
      }
      setEdits(initEdits);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(selectedPage); }, [selectedPage]);

  const handleSave = async (sectionId: string) => {
    setSaving(sectionId);
    await api.put(`/admin/pages/${sectionId}`, edits[sectionId]);
    setSaving(null);
    setSaved(sectionId);
    setTimeout(() => setSaved(null), 2000);
  };

  // Filtrar solo las secciones/claves que el frontend realmente usa
  const validSections = VALID_SECTIONS[selectedPage] || {};
  const filtered = sections.filter(s => {
    const validKeys = validSections[s.section];
    return validKeys && validKeys.includes(s.key);
  });

  const grouped: Record<string, Section[]> = {};
  for (const s of filtered) {
    if (!grouped[s.section]) grouped[s.section] = [];
    grouped[s.section].push(s);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Editor de Páginas</h2>
        <div className="flex border border-gray-300 rounded overflow-hidden text-xs">
          <button type="button" onClick={() => setEditLang('es')} className={`px-3 py-1.5 ${editLang === 'es' ? 'bg-primary-800 text-white' : 'bg-white text-gray-600'}`}>🇪🇸 ES</button>
          <button type="button" onClick={() => setEditLang('fr')} className={`px-3 py-1.5 ${editLang === 'fr' ? 'bg-primary-800 text-white' : 'bg-white text-gray-600'}`}>🇫🇷 FR</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {PAGES.map(page => (
          <button
            key={page}
            onClick={() => setSelectedPage(page)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPage === page ? 'bg-primary-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-800'
            }`}
          >
            {PAGE_LABELS[page]}
          </button>
        ))}
      </div>

      {PAGE_NOTES[selectedPage] && (
        <div className="mb-5 flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <span className="mt-0.5 shrink-0">ℹ️</span>
          <span>{PAGE_NOTES[selectedPage]}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([section, items]) => (
            <div key={section} className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                {SECTION_LABELS[section] || section}
              </h3>
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-600">
                        {KEY_LABELS[item.key] || item.key}
                      </label>
                      <div className="flex items-center gap-2">
                        {saved === item.id && <span className="text-xs text-green-600">✓ Guardado</span>}
                        <button
                          onClick={() => handleSave(item.id)}
                          disabled={saving === item.id}
                          className="text-xs bg-primary-800 text-white px-3 py-1 rounded hover:bg-primary-900 disabled:opacity-50"
                        >
                          {saving === item.id ? 'Guardando...' : 'Guardar'}
                        </button>
                      </div>
                    </div>
                    {item.key === 'icon' ? (
                      <div className="flex items-center gap-4">
                        <IconPicker
                          value={edits[item.id]?.valueEs || ''}
                          onChange={(emoji) => setEdits(prev => ({
                            ...prev,
                            [item.id]: { valueEs: emoji, valueFr: emoji },
                          }))}
                        />
                        <span className="text-xs text-gray-400">El icono se aplica en los dos idiomas</span>
                      </div>
                    ) : (
                      <textarea
                        value={editLang === 'es' ? (edits[item.id]?.valueEs || '') : (edits[item.id]?.valueFr || '')}
                        onChange={(e) => setEdits(prev => ({
                          ...prev,
                          [item.id]: {
                            ...(prev[item.id] || { valueEs: '', valueFr: '' }),
                            [editLang === 'es' ? 'valueEs' : 'valueFr']: e.target.value,
                          }
                        }))}
                        rows={item.key === 'text' || item.key.endsWith('eur') ? 3 : 2}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
