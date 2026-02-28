import { useEffect, useState } from 'react';
import api from '../../api';

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
  'home': 'Inicio', 'que-hacemos': 'Qué Hacemos',
  'quienes-somos': 'Quiénes Somos', 'colabora': 'Colabora',
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

  // Group by section
  const grouped: Record<string, Section[]> = {};
  for (const s of sections) {
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

      <div className="flex gap-2 mb-6">
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

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div></div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([section, items]) => (
            <div key={section} className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 capitalize">{section}</h3>
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id}>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-gray-600 font-mono">{item.key}</label>
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
                    <textarea
                      value={editLang === 'es' ? (edits[item.id]?.valueEs || '') : (edits[item.id]?.valueFr || '')}
                      onChange={(e) => setEdits(prev => ({
                        ...prev,
                        [item.id]: {
                          ...(prev[item.id] || { valueEs: '', valueFr: '' }),
                          [editLang === 'es' ? 'valueEs' : 'valueFr']: e.target.value,
                        }
                      }))}
                      rows={2}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
                    />
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
