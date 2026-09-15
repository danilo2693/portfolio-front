import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Upload,
  X,
  Check,
  AlertCircle,
  ExternalLink,
  Image as ImageIcon,
  Star,
  Sparkles,
} from 'lucide-react';
import IconSelectorModal, { type SelectedIcon } from './IconSelectorModal';

function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

interface Photo {
  id?: string;
  url: string;
  publicId?: string | null;
  alternativeText?: string | null;
}

interface StackItem {
  title: string;
  icon?: string;
}

interface Project {
  id: string;
  title: string;
  slug: string;
  description: any;
  siteUrl: string | null;
  githubUrl: string | null;
  stack: StackItem[];
  featured: boolean;
  enabled: boolean;
  orderIndex: number;
  locale: string;
  photos: Photo[];
}

interface Props {
  initialProjects: Project[];
}

export default function ProjectManager({ initialProjects }: Props) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'enabled' | 'disabled'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descEs, setDescEs] = useState('');
  const [activeDescTab, setActiveDescTab] = useState<'es' | 'en'>('es');
  const [siteUrl, setSiteUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [orderIndex, setOrderIndex] = useState(0);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [stack, setStack] = useState<StackItem[]>([]);
  const [newTechTitle, setNewTechTitle] = useState('');

  // Filtered
  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'enabled' && p.enabled) ||
        (filterStatus === 'disabled' && !p.enabled);
      return matchSearch && matchStatus;
    });
  }, [projects, search, filterStatus]);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setSlug('');
    setDescEn('');
    setDescEs('');
    setSiteUrl('');
    setGithubUrl('');
    setFeatured(false);
    setEnabled(true);
    setOrderIndex(projects.length + 1);
    setPhotos([]);
    setStack([]);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Project) => {
    setEditingId(p.id);
    setTitle(p.title);
    setSlug(p.slug);

    if (typeof p.description === 'object' && p.description !== null && !Array.isArray(p.description)) {
      setDescEn(p.description.en || '');
      setDescEs(p.description.es || '');
    } else if (typeof p.description === 'string') {
      setDescEn(p.description);
      setDescEs(p.description);
    } else {
      setDescEn('');
      setDescEs('');
    }

    setSiteUrl(p.siteUrl || '');
    setGithubUrl(p.githubUrl || '');
    setFeatured(p.featured);
    setEnabled(p.enabled);
    setOrderIndex(p.orderIndex);
    setPhotos(p.photos || []);

    let parsedStack: StackItem[] = [];
    if (Array.isArray(p.stack)) {
      parsedStack = p.stack;
    } else if (typeof p.stack === 'string') {
      try {
        parsedStack = JSON.parse(p.stack);
      } catch {
        parsedStack = [];
      }
    }
    setStack(parsedStack);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  // Cloudinary upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setErrorMessage('');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setPhotos((prev) => [
            ...prev,
            {
              url: data.url,
              publicId: data.publicId,
              alternativeText: title || 'Project photo',
            },
          ]);
        } else {
          setErrorMessage(data.error || 'Error al subir una de las imágenes.');
        }
      }
    } catch (err) {
      setErrorMessage('Error al conectar con el servidor de subidas.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const addTechTag = () => {
    if (!newTechTitle.trim()) return;
    setStack((prev) => [...prev, { title: newTechTitle.trim() }]);
    setNewTechTitle('');
  };

  const removeTechTag = (index: number) => {
    setStack((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('El título del proyecto es obligatorio.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    const payload = {
      id: editingId,
      title: title.trim(),
      slug: slug.trim() || undefined,
      description: {
        es: descEs.trim(),
        en: descEn.trim(),
      },
      siteUrl: siteUrl.trim() || null,
      githubUrl: githubUrl.trim() || null,
      featured,
      enabled,
      orderIndex: Number(orderIndex) || 0,
      stack,
      photos,
    };

    try {
      const res = await fetch('/api/admin/projects', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (editingId) {
          setProjects((prev) =>
            prev.map((item) => (item.id === editingId ? data.project : item))
          );
        } else {
          setProjects((prev) => [...prev, data.project]);
        }
        setIsModalOpen(false);
      } else {
        setErrorMessage(data.error || 'Error al guardar el proyecto.');
      }
    } catch (err) {
      setErrorMessage('Error al contactar con el servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este proyecto y sus fotos asociadas?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/projects?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(data.error || 'Error al eliminar el proyecto.');
      }
    } catch {
      alert('Error de conexión al eliminar el proyecto.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar proyectos por título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161b22] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
          >
            <option value="all">Todos los estados</option>
            <option value="enabled">Visibles</option>
            <option value="disabled">Ocultos</option>
          </select>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Proyecto</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-[#161b22] rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center text-gray-400">
            No se encontraron proyectos registrados.
          </div>
        ) : (
          filtered.map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-[#161b22] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs flex flex-col justify-between transition hover:border-gray-300 dark:hover:border-gray-700"
            >
              <div>
                {/* Image Header */}
                <div className="relative h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                  {project.photos && project.photos.length > 0 ? (
                    <img
                      src={project.photos[0].url}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400">
                      <ImageIcon className="w-8 h-8 opacity-40" />
                      <span className="text-xs">Sin fotos</span>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {project.featured && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white flex items-center gap-1 shadow-xs">
                        <Star className="w-3 h-3 fill-white" /> Destacado
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        project.enabled
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-gray-500/15 text-gray-500 border border-gray-500/20'
                      }`}
                    >
                      {project.enabled ? 'Visible' : 'Oculto'}
                    </span>
                  </div>

                  {project.photos && project.photos.length > 1 && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs">
                      +{project.photos.length - 1} más
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-white line-clamp-1">
                      {project.title}
                    </h3>
                    <span className="text-xs text-gray-400 font-mono">/{project.slug}</span>
                  </div>

                  {/* Stack Tags */}
                  {project.stack && project.stack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.stack.map((st, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[11px] font-medium border border-gray-200 dark:border-gray-700"
                        >
                          {st.title}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {typeof project.description === 'object' && project.description !== null
                      ? project.description.es || project.description.en || ''
                      : String(project.description || '')}
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-850/50">
                <div className="flex items-center gap-2">
                  {project.siteUrl && (
                    <a
                      href={project.siteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-500 hover:text-blue-600 transition"
                      title="Ver sitio"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-500 hover:text-blue-600 transition"
                      title="Ver repositorio GitHub"
                    >
                      <GithubIcon className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(project)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                    title="Eliminar proyecto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-3xl max-w-3xl w-full p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
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

            <form onSubmit={handleSave} className="space-y-5">
              {/* Basic fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Título del Proyecto *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej. Plataforma E-Commerce"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Slug Personalizado (Opcional)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="plataforma-ecommerce"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              {/* Links & Order */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    URL de Vista Previa (Sitio Web)
                  </label>
                  <input
                    type="url"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    URL de Código (GitHub)
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
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

              {/* Tech Stack Tags */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Stack Tecnológico
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsIconModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition cursor-pointer border border-blue-200 dark:border-blue-800 shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>+ Buscar en SVGL</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTechTitle}
                    onChange={(e) => setNewTechTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTechTag();
                      }
                    }}
                    placeholder="O escribe manual (ej. React, Astro, PostgreSQL)..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={addTechTag}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    + Agregar
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {stack.map((st, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-900/60"
                    >
                      {st.icon && st.icon.startsWith('http') ? (
                        <img src={st.icon} alt={st.title} className="w-3.5 h-3.5 object-contain shrink-0" />
                      ) : null}
                      <span>{st.title}</span>
                      <button
                        type="button"
                        onClick={() => removeTechTag(idx)}
                        className="hover:text-red-500 cursor-pointer ml-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Bilingual Description Tabs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Descripción del Proyecto
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
                    placeholder="Describe los objetivos, arquitectura y retos superados en este proyecto (Español)..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-y"
                  />
                ) : (
                  <textarea
                    rows={4}
                    value={descEn}
                    onChange={(e) => setDescEn(e.target.value)}
                    placeholder="Describe project highlights, architecture and impact (English)..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-y"
                  />
                )}
              </div>

              {/* Cloudinary Image Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Fotos del Proyecto (Subida Directa a Cloudinary)
                </label>

                <div className="flex flex-wrap gap-3 items-center">
                  {photos.map((ph, idx) => (
                    <div
                      key={idx}
                      className="relative w-24 h-24 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden group shadow-xs"
                    >
                      <img src={ph.url} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        title="Quitar foto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Upload button */}
                  <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 flex flex-col items-center justify-center gap-1 cursor-pointer text-gray-500 hover:text-blue-600 transition">
                    <Upload className="w-5 h-5" />
                    <span className="text-[10px] font-medium text-center px-1">
                      {isUploading ? 'Subiendo...' : '+ Foto'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Destacar en Portafolio</span>
                </label>

                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Visible públicamente</span>
                </label>
              </div>

              {/* Submit Buttons */}
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
                  disabled={isSaving || isUploading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'Guardando...' : 'Guardar Proyecto'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Icon Selector Modal */}
      <IconSelectorModal
        isOpen={isIconModalOpen}
        onClose={() => setIsIconModalOpen(false)}
        onSelectIcon={(selected) => {
          setStack((prev) => [
            ...prev,
            { title: selected.title, icon: selected.iconUrl },
          ]);
        }}
      />

    </div>
  );
}
