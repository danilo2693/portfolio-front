import { useState, useMemo } from 'react';
import {
  Mail,
  MailOpen,
  Trash2,
  Search,
  Clock,
  Reply,
  Inbox,
} from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string | Date;
}

interface Props {
  initialMessages: ContactMessage[];
}

export default function MessageManager({ initialMessages }: Props) {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [search, setSearch] = useState('');
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()) ||
        m.message.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        filterRead === 'all' ||
        (filterRead === 'unread' && !m.isRead) ||
        (filterRead === 'read' && m.isRead);

      return matchSearch && matchStatus;
    });
  }, [messages, search, filterRead]);

  const toggleRead = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: !currentStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, isRead: !currentStatus } : m))
        );
      }
    } catch {
      alert('Error al actualizar el estado del mensaje.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Deseas eliminar este mensaje de contacto?')) return;

    try {
      const res = await fetch(`/api/admin/messages?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      }
    } catch {
      alert('Error al eliminar el mensaje.');
    }
  };

  const formatDate = (dateVal: string | Date) => {
    try {
      const d = new Date(dateVal);
      return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o mensaje..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <select
          value={filterRead}
          onChange={(e) => setFilterRead(e.target.value as any)}
          className="px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
        >
          <option value="all">Todos los mensajes ({messages.length})</option>
          <option value="unread">
            No leídos ({messages.filter((m) => !m.isRead).length})
          </option>
          <option value="read">
            Leídos ({messages.filter((m) => m.isRead).length})
          </option>
        </select>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center text-gray-400 space-y-2">
            <Inbox className="w-10 h-10 mx-auto opacity-40" />
            <p className="text-sm font-medium">No se encontraron mensajes en esta vista.</p>
          </div>
        ) : (
          filtered.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-2xl border p-5 transition shadow-xs ${
                msg.isRead
                  ? 'bg-white dark:bg-[#161b22] border-gray-200 dark:border-gray-800 opacity-90'
                  : 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60 ring-1 ring-blue-500/20'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      msg.isRead
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {msg.name ? msg.name.charAt(0).toUpperCase() : 'M'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900 dark:text-white">
                        {msg.name}
                      </span>
                      {!msg.isRead && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-600 text-white">
                          Nuevo
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {msg.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400 self-start sm:self-auto">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDate(msg.createdAt)}</span>
                </div>
              </div>

              {/* Message body */}
              <p className="text-sm text-gray-700 dark:text-gray-300 py-3 whitespace-pre-wrap leading-relaxed">
                {msg.message}
              </p>

              {/* Actions bar */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                <button
                  onClick={() => toggleRead(msg.id, msg.isRead)}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition cursor-pointer"
                >
                  {msg.isRead ? (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      <span>Marcar como no leído</span>
                    </>
                  ) : (
                    <>
                      <MailOpen className="w-3.5 h-3.5" />
                      <span>Marcar como leído</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${msg.email}?subject=Respuesta a tu consulta en mi portafolio`}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-1.5 transition shadow-xs"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>Responder</span>
                  </a>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                    title="Eliminar mensaje"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
