import { useEffect, useState, FormEvent } from 'react';
import api from '../../api';
import Products from './Products';
import DonationsList from './DonationsList';

const FIELDS = [
  { key: 'bankAccount', label: 'Titular de cuenta', placeholder: 'Fundación Luz de Benín' },
  { key: 'bankIban', label: 'IBAN', placeholder: 'ES12 3456 7890 1234 5678 9012' },
  { key: 'bankBic', label: 'BIC / SWIFT', placeholder: 'CAIXESBBXXX' },
];

function BankSettings() {
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
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 max-w-2xl">
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
  );
}

type Tab = 'products' | 'donations' | 'bank';

const TABS: { key: Tab; label: string }[] = [
  { key: 'products', label: '📦 Productos de suscripción' },
  { key: 'donations', label: '💸 Historial de donaciones' },
  { key: 'bank', label: '🏦 Cuenta bancaria' },
];

export default function DonationsSettings() {
  const [activeTab, setActiveTab] = useState<Tab>('products');

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Donaciones</h2>

      {/* Tab nav */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-primary-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'products' && <Products />}
      {activeTab === 'donations' && <DonationsList />}
      {activeTab === 'bank' && <BankSettings />}
    </div>
  );
}
