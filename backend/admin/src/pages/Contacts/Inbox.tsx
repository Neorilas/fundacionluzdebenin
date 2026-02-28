import { useEffect, useState } from 'react';
import api from '../../api';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function ContactsInbox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);

  const load = () => {
    api.get('/admin/contacts').then(r => setMessages(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSelect = async (msg: Message) => {
    setSelected(msg);
    if (!msg.read) {
      await api.put(`/admin/contacts/${msg.id}/read`, { read: true });
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este mensaje?')) return;
    await api.delete(`/admin/contacts/${id}`);
    if (selected?.id === id) setSelected(null);
    load();
  };

  const formatDate = (s: string) => new Date(s).toLocaleString('es-ES');

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Mensajes de Contacto</h2>
      <div className="flex gap-4 h-[calc(100vh-200px)]">
        {/* List */}
        <div className="w-80 bg-white rounded-xl border border-gray-200 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-800"></div></div>
          ) : messages.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No hay mensajes</p>
          ) : (
            messages.map(msg => (
              <button
                key={msg.id}
                onClick={() => handleSelect(msg)}
                className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selected?.id === msg.id ? 'bg-primary-50 border-l-4 border-l-primary-800' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${!msg.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{msg.name}</p>
                    <p className="text-xs text-gray-500 truncate">{msg.subject}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(msg.createdAt)}</p>
                  </div>
                  {!msg.read && <span className="w-2 h-2 bg-accent rounded-full mt-1 ml-2 flex-shrink-0"></span>}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Detail */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6">
          {selected ? (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selected.subject}</h3>
                  <p className="text-sm text-gray-500">{selected.name} &lt;{selected.email}&gt;</p>
                  <p className="text-xs text-gray-400">{formatDate(selected.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`} className="text-sm bg-primary-800 text-white px-3 py-1.5 rounded-lg hover:bg-primary-900 transition-colors">Responder</a>
                  <button onClick={() => handleDelete(selected.id)} className="text-sm text-red-600 hover:text-red-800 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors">Eliminar</button>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.message}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <span className="text-6xl">📬</span>
                <p className="mt-2 text-sm">Selecciona un mensaje para verlo</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
