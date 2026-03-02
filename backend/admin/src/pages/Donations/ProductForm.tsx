import { useEffect, useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import BilingualField from '../../components/BilingualField';

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    nameEs: '',
    nameFr: '',
    descEs: '',
    descFr: '',
    amount: '',
    interval: 'month',
    order: '0',
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api.get(`/admin/stripe/products`)
      .then(r => {
        const product = r.data.find((p: { id: string }) => p.id === id);
        if (!product) { navigate('/admin/donations'); return; }
        setForm({
          nameEs: product.nameEs,
          nameFr: product.nameFr,
          descEs: product.descEs,
          descFr: product.descFr,
          amount: String(product.amount / 100),
          interval: product.interval,
          order: String(product.order),
        });
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (isEdit) {
        await api.put(`/admin/stripe/products/${id}`, {
          nameEs: form.nameEs,
          nameFr: form.nameFr,
          descEs: form.descEs,
          descFr: form.descFr,
          order: parseInt(form.order) || 0,
        });
      } else {
        const amountCents = Math.round(parseFloat(form.amount) * 100);
        if (!amountCents || amountCents < 100) {
          setError('El importe mínimo es 1€');
          setSaving(false);
          return;
        }
        await api.post('/admin/stripe/products', {
          nameEs: form.nameEs,
          nameFr: form.nameFr,
          descEs: form.descEs,
          descFr: form.descFr,
          amount: amountCents,
          interval: form.interval,
          order: parseInt(form.order) || 0,
        });
      }
      navigate('/admin/donations');
    } catch (err) {
      setError('Error al guardar el producto. Comprueba los datos e inténtalo de nuevo.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/donations')} className="text-gray-500 hover:text-gray-700 text-sm">
          ← Volver
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Editar producto' : 'Crear producto de suscripción'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        {isEdit && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            ⚠️ En modo edición solo puedes modificar nombres, descripciones y orden. El importe e intervalo son inmutables en Stripe.
          </div>
        )}

        <BilingualField
          label="Nombre"
          nameEs="nameEs"
          nameFr="nameFr"
          valueEs={form.nameEs}
          valueFr={form.nameFr}
          onChange={(name, value) => setForm(f => ({ ...f, [name]: value }))}
          required
        />

        <BilingualField
          label="Descripción"
          nameEs="descEs"
          nameFr="descFr"
          valueEs={form.descEs}
          valueFr={form.descFr}
          onChange={(name, value) => setForm(f => ({ ...f, [name]: value }))}
          multiline
          rows={2}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Importe (€) *
              {isEdit && <span className="ml-1 text-xs text-gray-400" title="No modificable en Stripe">🔒</span>}
            </label>
            <input
              type="number"
              required={!isEdit}
              disabled={isEdit}
              min="1"
              step="0.01"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="10"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Intervalo *
              {isEdit && <span className="ml-1 text-xs text-gray-400" title="No modificable en Stripe">🔒</span>}
            </label>
            <select
              disabled={isEdit}
              value={form.interval}
              onChange={e => setForm(f => ({ ...f, interval: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <option value="month">Mensual</option>
              <option value="year">Anual</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
            <input
              type="number"
              min="0"
              value={form.order}
              onChange={e => setForm(f => ({ ...f, order: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/admin/donations')}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-primary-800 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-900 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto en Stripe'}
          </button>
        </div>
      </form>
    </div>
  );
}
