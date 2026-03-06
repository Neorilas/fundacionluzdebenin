import { useEffect, useState } from 'react';
import api from '../../api';

interface Faq {
  id: string;
  questionEs: string;
  questionFr: string;
  answerEs: string;
  answerFr: string;
  order: number;
  active: boolean;
}

const empty = (): Omit<Faq, 'id'> => ({
  questionEs: '', questionFr: '', answerEs: '', answerFr: '', order: 0, active: true,
});

export default function FaqsList() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = () => {
    api.get('/admin/faqs').then(r => setFaqs(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const startEdit = (faq: Faq) => {
    setEditId(faq.id);
    setForm({ questionEs: faq.questionEs, questionFr: faq.questionFr, answerEs: faq.answerEs, answerFr: faq.answerFr, order: faq.order, active: faq.active });
  };

  const startNew = () => {
    const maxOrder = faqs.reduce((m, f) => Math.max(m, f.order), -1);
    setEditId('new');
    setForm({ ...empty(), order: maxOrder + 1 });
  };

  const cancel = () => { setEditId(null); setForm(empty()); };

  const save = async () => {
    if (!form.questionEs.trim() || !form.answerEs.trim()) return;
    setSaving(true);
    try {
      if (editId === 'new') {
        await api.post('/admin/faqs', form);
      } else {
        await api.put(`/admin/faqs/${editId}`, form);
      }
      setEditId(null);
      setForm(empty());
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('¿Eliminar esta pregunta?')) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/faqs/${id}`);
      load();
    } finally {
      setDeleting(null);
    }
  };

  const toggleActive = async (faq: Faq) => {
    await api.put(`/admin/faqs/${faq.id}`, { active: !faq.active });
    load();
  };

  const field = (key: keyof typeof form, label: string, multiline = false) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {multiline ? (
        <textarea
          rows={3}
          value={form[key] as string}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800 resize-y"
        />
      ) : (
        <input
          type={typeof form[key] === 'number' ? 'number' : 'text'}
          value={form[key] as string | number}
          onChange={e => setForm(f => ({ ...f, [key]: typeof form[key] === 'number' ? parseInt(e.target.value) || 0 : e.target.value }))}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
        />
      )}
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800" />
    </div>
  );

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Preguntas Frecuentes (FAQ)</h2>
        {editId !== 'new' && (
          <button onClick={startNew} className="bg-primary-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-900 transition-colors">
            + Nueva pregunta
          </button>
        )}
      </div>

      {/* Form: new or edit */}
      {editId !== null && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-800">{editId === 'new' ? 'Nueva pregunta' : 'Editar pregunta'}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field('questionEs', 'Pregunta (ES)')}
            {field('questionFr', 'Pregunta (FR)')}
            {field('answerEs', 'Respuesta (ES)', true)}
            {field('answerFr', 'Respuesta (FR)', true)}
          </div>

          <div className="flex items-center gap-6">
            <div className="w-24">{field('order', 'Orden')}</div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="w-4 h-4 rounded accent-primary-800" />
              <span className="text-sm text-gray-700">Activa (visible en la web)</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button onClick={save} disabled={saving || !form.questionEs.trim() || !form.answerEs.trim()} className="bg-primary-800 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-900 disabled:opacity-50 transition-colors">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button onClick={cancel} className="border border-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {faqs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          No hay preguntas aún. Crea la primera.
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map(faq => (
            <div key={faq.id} className={`bg-white rounded-xl border p-5 transition-opacity ${!faq.active ? 'opacity-60' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{faq.questionEs || '(sin pregunta)'}</p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{faq.answerEs}</p>
                  {faq.questionFr && <p className="text-xs text-gray-400 mt-1 italic truncate">FR: {faq.questionFr}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400">#{faq.order}</span>
                  <button
                    onClick={() => toggleActive(faq)}
                    title={faq.active ? 'Desactivar' : 'Activar'}
                    className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${faq.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    {faq.active ? 'activa' : 'inactiva'}
                  </button>
                  <button
                    onClick={() => editId === faq.id ? cancel() : startEdit(faq)}
                    className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {editId === faq.id ? 'Cancelar' : 'Editar'}
                  </button>
                  <button
                    onClick={() => remove(faq.id)}
                    disabled={deleting === faq.id}
                    className="text-sm px-3 py-1.5 border border-red-200 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    {deleting === faq.id ? '...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
