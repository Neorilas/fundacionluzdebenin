import { useEffect, useState, FormEvent } from 'react';
import api from '../../api';

const FIELDS = [
  { key: 'bankAccount', label: 'Titular de cuenta', placeholder: 'Fundación Luz de Benín' },
  { key: 'bankIban', label: 'IBAN', placeholder: 'ES12 3456 7890 1234 5678 9012' },
  { key: 'bankBic', label: 'BIC / SWIFT', placeholder: 'CAIXESBBXXX' },
];

export default function DonationsSettings() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/admin/settings').then(r => setValues(r.data)).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const updates: Record<string, string> = {};
    for (const f of FIELDS) { updates[f.key] = values[f.key] || ''; }
    await api.put('/admin/settings', updates);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div></div>;

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Información de Donaciones</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="bg-accent-light border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          <strong>📢 Stripe (futuro):</strong> Aquí aparecerá la integración con Stripe cuando esté disponible. Por ahora, configura los datos de transferencia bancaria.
        </div>

        {FIELDS.map(f => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
            <input
              type="text"
              value={values[f.key] || ''}
              onChange={(e) => setValues(v => ({ ...v, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
            />
          </div>
        ))}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {saved && <span className="text-sm text-green-600 font-medium">✓ Guardado correctamente</span>}
          <div className="ml-auto">
            <button type="submit" disabled={saving} className="bg-primary-800 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-900 disabled:opacity-50 transition-colors">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
