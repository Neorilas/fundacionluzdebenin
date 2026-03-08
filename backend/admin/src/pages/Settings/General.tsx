import { useEffect, useState, FormEvent, useRef } from 'react';
import api from '../../api';
import BilingualField from '../../components/BilingualField';

const SIMPLE_FIELDS = [
  { key: 'emailContact', label: 'Email de contacto', placeholder: 'info@fundacionluzdebenin.org' },
  { key: 'phoneContact', label: 'Teléfono de contacto', placeholder: '+34 612 345 678' },
  { key: 'address', label: 'Dirección', placeholder: 'Madrid, España' },
  { key: 'socialFacebook', label: 'Facebook URL', placeholder: 'https://facebook.com/...' },
  { key: 'socialInstagram', label: 'Instagram URL', placeholder: 'https://instagram.com/...' },
  { key: 'socialX', label: 'X (Twitter) URL', placeholder: 'https://x.com/...' },
  { key: 'foundationNif', label: 'NIF de la fundación', placeholder: 'G12345678' },
  { key: 'foundationRegistry', label: 'Nº de registro', placeholder: 'Registro de Fundaciones nº 1234' },
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
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File, key: 'logoUrl' | 'faviconUrl' | 'colaboraEmpresasHeroImage') => {
    const setUploading =
      key === 'logoUrl' ? setUploadingLogo :
      key === 'faviconUrl' ? setUploadingFavicon :
      setUploadingHero;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const token = localStorage.getItem('admin_token');
      const r = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await r.json();
      if (data.url) {
        setValues(v => ({ ...v, [key]: data.url }));
      } else {
        alert('Error al subir la imagen');
      }
    } catch {
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    api.get('/admin/settings').then(r => setValues(r.data)).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const updates: Record<string, string> = {};
    updates.siteName = values.siteName || '';
    updates.siteNameFr = values.siteNameFr || '';
    for (const f of SIMPLE_FIELDS) { updates[f.key] = values[f.key] ?? ''; }
    updates.showEmail   = values.showEmail   ?? '1';
    updates.showPhone   = values.showPhone   ?? '1';
    updates.showAddress = values.showAddress ?? '1';
    updates.logoUrl    = values.logoUrl    || '/logo.jpg';
    updates.faviconUrl = values.faviconUrl || '/logo.jpg';
    updates.colaboraEmpresasHeroImage = values.colaboraEmpresasHeroImage || '';
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

        <div className="pt-2">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Visibilidad en la página de Contacto</h4>
          <div className="space-y-3">
            {([
              { key: 'showEmail',   label: 'Mostrar email' },
              { key: 'showPhone',   label: 'Mostrar teléfono' },
              { key: 'showAddress', label: 'Mostrar dirección' },
            ] as const).map(f => {
              const on = values[f.key] !== '0';
              return (
                <label key={f.key} className="flex items-center gap-3 cursor-pointer select-none">
                  <button
                    type="button"
                    onClick={() => setValues(v => ({ ...v, [f.key]: on ? '0' : '1' }))}
                    className="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-800 focus:ring-offset-1"
                    style={{ backgroundColor: on ? '#065F46' : '#9CA3AF' }}
                    aria-checked={on}
                    role="switch"
                  >
                    <span
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
                      style={{ transform: on ? 'translateX(1.375rem)' : 'translateX(0.25rem)' }}
                    />
                  </button>
                  <span className="text-sm text-gray-700">
                    {f.label}
                    <span className={`ml-2 text-xs font-medium ${on ? 'text-green-600' : 'text-gray-400'}`}>
                      {on ? 'visible' : 'oculto'}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Identidad visual</h4>
          <div className="grid grid-cols-2 gap-6">
            {([
              { key: 'logoUrl' as const, label: 'Logo del sitio', ref: logoInputRef, uploading: uploadingLogo },
              { key: 'faviconUrl' as const, label: 'Favicon / icono', ref: faviconInputRef, uploading: uploadingFavicon },
            ]).map(({ key, label, ref, uploading }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                {values[key] && (
                  <img
                    src={values[key]}
                    alt={label}
                    className="h-16 w-auto object-contain rounded border border-gray-200 mb-2 bg-gray-50 p-1"
                  />
                )}
                <input
                  ref={ref}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) uploadImage(file, key);
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => ref.current?.click()}
                  className="text-xs px-3 py-1.5 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  {uploading ? 'Subiendo…' : 'Cambiar imagen'}
                </button>
                <input
                  type="text"
                  value={values[key] || ''}
                  onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                  placeholder="/logo.jpg"
                  className="mt-2 w-full border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-800"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Imagen hero — Colabora Empresas</h4>
          <div className="space-y-2">
            {values.colaboraEmpresasHeroImage && (
              <img
                src={values.colaboraEmpresasHeroImage}
                alt="Hero colabora empresas"
                className="h-24 w-auto object-cover rounded border border-gray-200 bg-gray-50"
              />
            )}
            <input
              ref={heroInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) uploadImage(file, 'colaboraEmpresasHeroImage');
                e.target.value = '';
              }}
            />
            <button
              type="button"
              disabled={uploadingHero}
              onClick={() => heroInputRef.current?.click()}
              className="text-xs px-3 py-1.5 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {uploadingHero ? 'Subiendo…' : 'Cambiar imagen hero'}
            </button>
            <input
              type="text"
              value={values.colaboraEmpresasHeroImage || ''}
              onChange={e => setValues(v => ({ ...v, colaboraEmpresasHeroImage: e.target.value }))}
              placeholder="https://... o /uploads/imagen.webp"
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-800"
            />
          </div>
        </div>

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
