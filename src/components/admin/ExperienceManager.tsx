import { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  Briefcase,
  Search,
} from 'lucide-react';

interface Experience {
  id: string;
  title: string;
  companyName: string;
  periodTime: string;
  description: any;
  orderIndex: number;
  enabled: boolean;
  locale: string;
}

interface Props {
  initialExperiences: Experience[];
}

export default function ExperienceManager({ initialExperiences }: Props) {
  const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [periodTime, setPeriodTime] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descEs, setDescEs] = useState('');
  const [activeDescTab, setActiveDescTab] = useState<'es' | 'en'>('es');
  const [orderIndex, setOrderIndex] = useState(0);
  const [enabled, setEnabled] = useState(true);

  const filtered = useMemo(() => {
    return experiences.filter(
      (e) =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.companyName.toLowerCase().includes(search.toLowerCase())
    );
  }, [experiences, search]);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setCompanyName('');
    setPeriodTime('');
    setDescEn('');
    setDescEs('');
    setOrderIndex(experiences.length + 1);
    setEnabled(true);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const openEditModal = (exp: Experience) => {
    setEditingId(exp.id);
    setTitle(exp.title);
    setCompanyName(exp.companyName);
    setPeriodTime(exp.periodTime);

    if (typeof exp.description === 'object' && exp.description !== null && !Array.isArray(exp.description)) {
      setDescEn(exp.description.en || '');
      setDescEs(exp.description.es || '');
    } else if (typeof exp.description === 'string') {
      setDescEn(exp.description);
      setDescEs(exp.description);
    } else {
      setDescEn('');
      setDescEs('');
    }

    setOrderIndex(exp.orderIndex);
    setEnabled(exp.enabled);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !companyName.trim() || !periodTime.trim()) {
      setErrorMessage('Título, empresa y periodo de tiempo son obligatorios.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    const payload = {
      id: editingId,
      title: title.trim(),
      companyName: companyName.trim(),
      periodTime: periodTime.trim(),
      description: {
        es: descEs.trim(),
        en: descEn.trim(),
      },
      orderIndex: Number(orderIndex) || 0,
      enabled,
      locale: 'all',
    };

    try {
      const res = await fetch('/api/admin/experiences', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (editingId) {
          setExperiences((prev) =>
            prev.map((item) => (item.id === editingId ? data.experience : item))
          );
        } else {
          setExperiences((prev) => [...prev, data.experience]);
        }
        setIsModalOpen(false);
      } else {
        setErrorMessage(data.error || 'Error al guardar la experiencia.');
      }
    } catch {
      setErrorMessage('Error de conexión con el servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta experiencia laboral?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/experiences?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setExperiences((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert(data.error || 'Error al eliminar la experiencia.');
      }
    } catch {
      alert('Error de conexión al eliminar la experiencia.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cargo o empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Experiencia</span>
        </button>
      </div>

      {/* Experience List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center text-gray-400">
            No se encontraron experiencias registradas.
          </div>
        ) : (
          filtered.map((exp) => (
            <div
              key={exp.id}
              className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-gray-300 dark:hover:border-gray-700"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">
                    {exp.title}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      exp.enabled
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-gray-500/15 text-gray-500'
                    }`}
                  >
                    {exp.enabled ? 'Visible' : 'Oculto'}
                  </span>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium pl-10">
                  <span className="text-gray-800 dark:text-gray-200 font-semibold">{exp.companyName}</span> • <span>{exp.periodTime}</span> (Orden: {exp.orderIndex})
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400 pl-10 line-clamp-2">
                  {typeof exp.description === 'object' && exp.description !== null
                    ? exp.description.es || exp.description.en || ''
                    : String(exp.description || '')}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 md:self-center self-end">
                <button
                  onClick={() => openEditModal(exp)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                  title="Eliminar experiencia"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId ? 'Editar Experiencia' : 'Nueva Experiencia Laboral'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Cargo / Posición *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej. Senior Full Stack Developer"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Empresa / Organización *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ej. Tech Corp"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Periodo de Tiempo *
                  </label>
                  <input
                    type="text"
                    required
                    value={periodTime}
                    onChange={(e) => setPeriodTime(e.target.value)}
                    placeholder="Ej. 2023 - Presente"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Orden de Visualización
                  </label>
                  <input
                    type="number"
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Logros y Responsabilidades
                  </label>
                  <div className="flex items-center gap-1 p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setActiveDescTab('es')}
                      className={`px-3 py-1 rounded-md transition cursor-pointer ${
                        activeDescTab === 'es' ? 'bg-white dark:bg-gray-700 shadow-xs font-bold' : 'text-gray-500'
                      }`}
                    >
                      Español
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDescTab('en')}
                      className={`px-3 py-1 rounded-md transition cursor-pointer ${
                        activeDescTab === 'en' ? 'bg-white dark:bg-gray-700 shadow-xs font-bold' : 'text-gray-500'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>

                {activeDescTab === 'es' ? (
                  <textarea
                    rows={4}
                    value={descEs}
                    onChange={(e) => setDescEs(e.target.value)}
                    placeholder="Describe tus principales responsabilidades y tecnologías empleadas (Español)..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-y"
                  />
                ) : (
                  <textarea
                    rows={4}
                    value={descEn}
                    onChange={(e) => setDescEn(e.target.value)}
                    placeholder="Describe key responsibilities and impact (English)..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-y"
                  />
                )}
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Visible en el portafolio</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-medium transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'Guardando...' : 'Guardar Experiencia'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
