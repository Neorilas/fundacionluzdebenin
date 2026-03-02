import { useEffect, useState, FormEvent } from 'react';
import api from '../../api';
import BilingualField from '../../components/BilingualField';

const SIMPLE_FIELDS = [
  { key: 'emailContact', label: 'Email de contacto', placeholder: 'info@fundacionluzdebenin.org' },
  { key: 'phoneContact', label: 'Teléfono de contacto', placeholder: '+34 612 345 678' },
  { key: 'address', label: 'Dirección', placeholder: 'Madrid, España' },
  { key: 'socialFacebook', label: 'Facebook URL', placeholder: 'https://facebook.com/...' },
  { key: 'socialInstagram', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
];

const PASSWORD_FIELDS = [
  { key: 'currentPassword', label: 'Contraseña actual', type: 'password' },
  { key: 'newPassword', label: 'Nueva contraseña', type: 'password' },
];

export default function GeneralSettings() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState('');

  useEffect(() => {
    api.get('/admin/settings').then(r => setValues(r.data)).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const updates: Record<string, string> = {};
    updates.siteName = values.siteName || '';
    updates.siteNameFr = values.siteNameFr || '';
    for (const f of SIMPLE_FIELDS) { updates[f.key] = values[f.key] || ''; }
    await api.put('/admin/settings', updates);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword.length < 6) {
      setPwMessage('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    setPwSaving(true);
    try {
      await api.put('/admin/settings/account/password', pwForm);
      setPwMessage('✓ Contraseña actualizada correctamente');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch {
      setPwMessage('✗ Error al actualizar la contraseña');
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div></div>;

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Configuración General</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="font-semibold text-gray-800 mb-4">Información del sitio</h3>

        <BilingualField
          label="Nombre del sitio"
          nameEs="siteName"
          nameFr="siteNameFr"
          valueEs={values.siteName || ''}
          valueFr={values.siteNameFr || ''}
          onChange={(name, value) => setValues(v => ({ ...v, [name]: value }))}
        />

        {SIMPLE_FIELDS.map(f => (
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

      <form onSubmit={handlePasswordChange} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="font-semibold text-gray-800 mb-4">Cambiar contraseña</h3>
        {PASSWORD_FIELDS.map(f => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
            <input
              type={f.type}
              value={pwForm[f.key as keyof typeof pwForm]}
              onChange={(e) => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
            />
          </div>
        ))}
        {pwMessage && (
          <p className={`text-sm ${pwMessage.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>{pwMessage}</p>
        )}
        <div className="flex justify-end pt-2">
          <button type="submit" disabled={pwSaving} className="bg-gray-800 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50 transition-colors">
            {pwSaving ? 'Cambiando...' : 'Cambiar contraseña'}
          </button>
        </div>
      </form>
    </div>
  );
}
