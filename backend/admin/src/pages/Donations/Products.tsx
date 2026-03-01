import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

interface StripeProduct {
  id: string;
  nameEs: string;
  nameFr: string;
  amount: number;
  interval: string;
  order: number;
  active: boolean;
  stripeProductId: string | null;
  stripePriceId: string | null;
  createdAt: string;
}

export default function Products() {
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.get('/admin/stripe/products')
      .then(r => setProducts(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleArchive = async (id: string) => {
    if (!confirm('¿Archivar este producto? Las suscripciones existentes no se cancelarán, pero el producto no estará disponible para nuevas donaciones.')) return;
    setArchiving(id);
    await api.delete(`/admin/stripe/products/${id}`).catch(console.error);
    setArchiving(null);
    load();
  };

  const formatAmount = (cents: number, interval: string) => {
    const euros = (cents / 100).toFixed(0);
    return `${euros}€/${interval === 'year' ? 'año' : 'mes'}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Productos de suscripción</h3>
        <Link
          to="/admin/donations/products/new"
          className="bg-primary-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-900 transition-colors"
        >
          + Crear producto
        </Link>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 mb-4">
        ⚠️ <strong>Nota Stripe:</strong> El importe no puede modificarse una vez creado (limitación de Stripe). Para cambiar el precio, archiva el producto actual y crea uno nuevo.
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3">📦</div>
          <p>No hay productos creados todavía.</p>
          <Link to="/admin/donations/products/new" className="text-primary-800 hover:underline text-sm mt-1 inline-block">
            Crear el primer producto →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre (ES)</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Importe</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Intervalo</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Orden</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map(product => (
                <tr key={product.id} className={`hover:bg-gray-50 ${!product.active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-gray-900">{product.nameEs}</td>
                  <td className="px-4 py-3 text-gray-700">{formatAmount(product.amount, product.interval)}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{product.interval === 'month' ? 'Mensual' : 'Anual'}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{product.order}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                      product.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {product.active ? 'Activo' : 'Archivado'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link
                      to={`/admin/donations/products/${product.id}`}
                      className="text-primary-800 hover:underline text-xs font-medium"
                    >
                      Editar
                    </Link>
                    {product.active && (
                      <button
                        onClick={() => handleArchive(product.id)}
                        disabled={archiving === product.id}
                        className="text-gray-500 hover:text-red-600 text-xs font-medium disabled:opacity-50"
                      >
                        {archiving === product.id ? '...' : 'Archivar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
