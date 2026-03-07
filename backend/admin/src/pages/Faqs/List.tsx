import { useEffect, useRef, useState } from 'react';
import api from '../../api';

async function translateText(text: string): Promise<string> {
  if (!text.trim()) return '';
  const r = await api.post('/admin/translate', { text, from: 'es', to: 'fr' });
  return r.data.translatedText || '';
}

interface Faq {
  id: string;
  questionEs: string;
  questionFr: string;
  answerEs: string;
  answerFr: string;
  order: number;
  active: boolean;
}

const emptyForm = () => ({
  questionEs: '', questionFr: '', answerEs: '', answerFr: '', order: 0, active: true,
});

interface RowForm {
  questionEs: string; questionFr: string;
  answerEs: string; answerFr: string;
  order: number; active: boolean;
}

function FaqRow({
  faq,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
  onDelete,
  onToggleActive,
}: {
  faq: Faq;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (form: RowForm) => Promise<void>;
  onCancel: () => void;
  onDelete: () => Promise<void>;
  onToggleActive: () => Promise<void>;
}) {
  const [form, setForm] = useState<RowForm>({
    questionEs: faq.questionEs, questionFr: faq.questionFr,
    answerEs: faq.answerEs, answerFr: faq.answerFr,
    order: faq.order, active: faq.active,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [translating, setTranslating] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  // Reset form when editing starts (picks up latest faq data)
  useEffect(() => {
    if (isEditing) {
      setForm({
        questionEs: faq.questionEs, questionFr: faq.questionFr,
        answerEs: faq.answerEs, answerFr: faq.answerFr,
        order: faq.order, active: faq.active,
      });
      // Scroll into view after expand
      setTimeout(() => rowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
    }
  }, [isEditing]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!form.questionEs.trim() || !form.answerEs.trim()) return;
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar esta pregunta? No se puede deshacer.')) return;
    setDeleting(true);
    try { await onDelete(); } finally { setDeleting(false); }
  };

  const handleTranslate = async () => {
    setTranslating(true);
    try {
      const [questionFr, answerFr] = await Promise.all([
        translateText(form.questionEs),
        translateText(form.answerEs),
      ]);
      setForm(f => ({ ...f, questionFr, answerFr }));
    } catch { alert('Error al traducir. Inténtalo de nuevo.'); }
    finally { setTranslating(false); }
  };

  return (
    <div
      ref={rowRef}
      className={`bg-white rounded-xl border transition-all ${
        isEditing ? 'border-primary-400 shadow-md' : !faq.active ? 'border-gray-200 opacity-60' : 'border-gray-200'
      }`}
    >
      {/* Row header — always visible */}
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">{faq.questionEs || '(sin pregunta)'}</p>
          {!isEditing && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{faq.answerEs}</p>
          )}
          {!isEditing && faq.questionFr && (
            <p className="text-xs text-gray-400 mt-1 italic truncate">FR: {faq.questionFr}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-gray-400">#{faq.order}</span>
          <button
            onClick={onToggleActive}
            title={faq.active ? 'Desactivar' : 'Activar'}
            className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
              faq.active
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {faq.active ? 'activa' : 'inactiva'}
          </button>
          {!isEditing && (
            <>
              <button
                onClick={onStartEdit}
                className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Editar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-sm px-3 py-1.5 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                {deleting ? '...' : 'Eliminar'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Inline edit form — expands below the header */}
      {isEditing && (
        <div className="border-t border-gray-100 p-5 space-y-4 bg-gray-50 rounded-b-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ES */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Pregunta (ES) *</label>
                <input
                  type="text"
                  value={form.questionEs}
                  onChange={e => setForm(f => ({ ...f, questionEs: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Respuesta (ES) *</label>
                <textarea
                  rows={4}
                  value={form.answerEs}
                  onChange={e => setForm(f => ({ ...f, answerEs: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800 resize-y"
                />
              </div>
            </div>
            {/* FR */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Pregunta (FR)</label>
                <input
                  type="text"
                  value={form.questionFr}
                  onChange={e => setForm(f => ({ ...f, questionFr: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Respuesta (FR)</label>
                <textarea
                  rows={4}
                  value={form.answerFr}
                  onChange={e => setForm(f => ({ ...f, answerFr: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800 resize-y"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleTranslate}
              disabled={translating || !form.questionEs.trim() || !form.answerEs.trim()}
              className="flex items-center gap-2 text-sm px-3 py-1.5 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-colors"
            >
              {translating
                ? <><span className="animate-spin inline-block w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full" /> Traduciendo...</>
                : <><span>🌐</span> Auto-traducir FR</>
              }
            </button>
            <div className="flex items-center gap-2 ml-auto">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="number"
                  value={form.order}
                  onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
                  className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-800"
                />
                <span className="text-xs text-gray-500">orden</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                  className="w-4 h-4 rounded accent-primary-800"
                />
                <span className="text-sm text-gray-700">Activa</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving || !form.questionEs.trim() || !form.answerEs.trim()}
              className="bg-primary-800 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-900 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button
              onClick={onCancel}
              className="border border-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="ml-auto text-sm px-3 py-2 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {deleting ? '...' : 'Eliminar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── New FAQ form ──────────────────────────────────────────────────────────────

function NewFaqForm({ maxOrder, onSave, onCancel }: {
  maxOrder: number;
  onSave: (form: RowForm) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<RowForm>({ ...emptyForm(), order: maxOrder + 1 });
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);

  const handleTranslate = async () => {
    setTranslating(true);
    try {
      const [questionFr, answerFr] = await Promise.all([
        translateText(form.questionEs),
        translateText(form.answerEs),
      ]);
      setForm(f => ({ ...f, questionFr, answerFr }));
    } catch { alert('Error al traducir.'); }
    finally { setTranslating(false); }
  };

  const handleSave = async () => {
    if (!form.questionEs.trim() || !form.answerEs.trim()) return;
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-xl border border-primary-400 shadow-md p-6 space-y-4">
      <h3 className="font-semibold text-gray-800">Nueva pregunta frecuente</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Pregunta (ES) *</label>
            <input type="text" value={form.questionEs} onChange={e => setForm(f => ({ ...f, questionEs: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Respuesta (ES) *</label>
            <textarea rows={4} value={form.answerEs} onChange={e => setForm(f => ({ ...f, answerEs: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800 resize-y" />
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Pregunta (FR)</label>
            <input type="text" value={form.questionFr} onChange={e => setForm(f => ({ ...f, questionFr: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Respuesta (FR)</label>
            <textarea rows={4} value={form.answerFr} onChange={e => setForm(f => ({ ...f, answerFr: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800 resize-y" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={handleTranslate} disabled={translating || !form.questionEs.trim() || !form.answerEs.trim()}
          className="flex items-center gap-2 text-sm px-3 py-1.5 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-colors">
          {translating
            ? <><span className="animate-spin inline-block w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full" /> Traduciendo...</>
            : <><span>🌐</span> Auto-traducir FR</>}
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
              className="w-16 border border-gray-300 rounded-md px-2 py-1 text-sm" />
            <span className="text-xs text-gray-500">orden</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="w-4 h-4 rounded accent-primary-800" />
            <span className="text-sm text-gray-700">Activa</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <button onClick={handleSave} disabled={saving || !form.questionEs.trim() || !form.answerEs.trim()}
          className="bg-primary-800 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-900 disabled:opacity-50 transition-colors">
          {saving ? 'Guardando...' : 'Crear pregunta'}
        </button>
        <button onClick={onCancel} className="border border-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ── Main list page ────────────────────────────────────────────────────────────

export default function FaqsList() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  const load = () => {
    api.get('/admin/faqs')
      .then(r => setFaqs(r.data))
      .catch(() => alert('Error al cargar las FAQs.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (id: string, form: RowForm) => {
    await api.put(`/admin/faqs/${id}`, form);
    setEditId(null);
    load();
  };

  const handleCreate = async (form: RowForm) => {
    await api.post('/admin/faqs', form);
    setShowNew(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/admin/faqs/${id}`);
    if (editId === id) setEditId(null);
    load();
  };

  const handleToggleActive = async (faq: Faq) => {
    await api.put(`/admin/faqs/${faq.id}`, { active: !faq.active });
    load();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800" />
    </div>
  );

  const maxOrder = faqs.reduce((m, f) => Math.max(m, f.order), -1);

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Preguntas Frecuentes (FAQ)</h2>
        {!showNew && (
          <button
            onClick={() => { setShowNew(true); setEditId(null); }}
            className="bg-primary-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-900 transition-colors"
          >
            + Nueva pregunta
          </button>
        )}
      </div>

      {showNew && (
        <NewFaqForm
          maxOrder={maxOrder}
          onSave={handleCreate}
          onCancel={() => setShowNew(false)}
        />
      )}

      {faqs.length === 0 && !showNew ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          No hay preguntas aún. Crea la primera.
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map(faq => (
            <FaqRow
              key={faq.id}
              faq={faq}
              isEditing={editId === faq.id}
              onStartEdit={() => { setEditId(faq.id); setShowNew(false); }}
              onSave={form => handleSave(faq.id, form)}
              onCancel={() => setEditId(null)}
              onDelete={() => handleDelete(faq.id)}
              onToggleActive={() => handleToggleActive(faq)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
