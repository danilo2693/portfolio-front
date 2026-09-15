import { useState } from 'react';
import {
  Save,
  Check,
  Upload,
  User,
  FileText,
  Plus,
  Trash2,
  AlertCircle,
  Link2,
} from 'lucide-react';

interface LinkItem {
  title: string;
  url: string;
  icon?: string;
}

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  summary: any;
  description: any;
  avatarUrl: string | null;
  avatarPublicId: string | null;
  cvUrl: string | null;
  cvPublicId: string | null;
  links: LinkItem[];
}

interface Props {
  initialProfile: Profile;
}

export default function ProfileManager({ initialProfile }: Props) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [name, setName] = useState(initialProfile.name || '');
  const [email, setEmail] = useState(initialProfile.email || '');
  const [phone, setPhone] = useState(initialProfile.phone || '');

  // Bilingual Summary
  const [summaryEs, setSummaryEs] = useState(
    typeof initialProfile.summary === 'object' && initialProfile.summary !== null
      ? initialProfile.summary.es || ''
      : String(initialProfile.summary || '')
  );
  const [summaryEn, setSummaryEn] = useState(
    typeof initialProfile.summary === 'object' && initialProfile.summary !== null
      ? initialProfile.summary.en || ''
      : ''
  );

  // Bilingual Description
  const [descEs, setDescEs] = useState(
    typeof initialProfile.description === 'object' && initialProfile.description !== null
      ? initialProfile.description.es || ''
      : String(initialProfile.description || '')
  );
  const [descEn, setDescEn] = useState(
    typeof initialProfile.description === 'object' && initialProfile.description !== null
      ? initialProfile.description.en || ''
      : ''
  );

  const [activeTab, setActiveTab] = useState<'es' | 'en'>('es');

  // Media
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatarUrl || '');
  const [avatarPublicId, setAvatarPublicId] = useState(initialProfile.avatarPublicId || '');
  const [cvUrl, setCvUrl] = useState(initialProfile.cvUrl || '');
  const [cvPublicId, setCvPublicId] = useState(initialProfile.cvPublicId || '');

  // Social Links
  const [links, setLinks] = useState<LinkItem[]>(
    Array.isArray(initialProfile.links) ? initialProfile.links : []
  );
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // States
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCv, setIsUploadingCv] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAvatarUrl(data.url);
        setAvatarPublicId(data.publicId);
      } else {
        setErrorMessage(data.error || 'Error al subir la foto de perfil.');
      }
    } catch {
      setErrorMessage('Error de conexión al subir la imagen.');
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCv(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('raw', 'true');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCvUrl(data.url);
        setCvPublicId(data.publicId);
      } else {
        setErrorMessage(data.error || 'Error al subir el archivo CV.');
      }
    } catch {
      setErrorMessage('Error de conexión al subir el CV.');
    } finally {
      setIsUploadingCv(false);
      e.target.value = '';
    }
  };

  const addLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
    setLinks((prev) => [
      ...prev,
      {
        title: newLinkTitle.trim(),
        url: newLinkUrl.trim(),
      },
    ]);
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const removeLink = (index: number) => {
    setLinks((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    setSaveSuccess(false);

    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      summary: {
        es: summaryEs.trim(),
        en: summaryEn.trim(),
      },
      description: {
        es: descEs.trim(),
        en: descEn.trim(),
      },
      avatarUrl: avatarUrl || null,
      avatarPublicId: avatarPublicId || null,
      cvUrl: cvUrl || null,
      cvPublicId: cvPublicId || null,
      links,
    };

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(data.profile);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setErrorMessage(data.error || 'Error al actualizar el perfil.');
      }
    } catch {
      setErrorMessage('Error de conexión con el servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
      {/* Alerts */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-3 text-sm font-medium">
          <Check className="w-5 h-5 shrink-0" />
          <span>¡Perfil y configuración guardados correctamente en PostgreSQL!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-3 text-sm font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Profile & CV Media section */}
      <div className="bg-white dark:bg-[#161b22] rounded-3xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 space-y-6 shadow-xs">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          <span>Identidad y Archivos Multimedia</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Avatar */}
          <div className="flex items-center gap-5 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/50">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-500/30 shrink-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>

            <div className="space-y-1.5 flex-1">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">Foto de Perfil</span>
              <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium cursor-pointer transition shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploadingAvatar ? 'Subiendo...' : 'Subir a Cloudinary'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isUploadingAvatar}
                  className="hidden"
                />
              </label>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl('')}
                  className="block text-[11px] text-red-500 hover:underline cursor-pointer pt-0.5"
                >
                  Quitar foto
                </button>
              )}
            </div>
          </div>

          {/* CV PDF */}
          <div className="flex items-center gap-5 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/50">
            <div className="w-20 h-20 rounded-2xl border border-gray-200 dark:border-gray-700 shrink-0 bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <FileText className="w-8 h-8" />
            </div>

            <div className="space-y-1.5 flex-1">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">Currículum Vitae (PDF)</span>
              <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white text-xs font-medium cursor-pointer transition shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploadingCv ? 'Subiendo...' : 'Cargar Archivo PDF'}</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleCvUpload}
                  disabled={isUploadingCv}
                  className="hidden"
                />
              </label>
              {cvUrl && (
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[11px] text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[200px]"
                >
                  ↗ Ver CV actual
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Personal Info inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Nombre Público
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Teléfono / WhatsApp
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+57 300 000 0000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Bios & Summaries Section */}
      <div className="bg-white dark:bg-[#161b22] rounded-3xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 space-y-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              Biografía y Resumen Profesional
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Personaliza el extracto del header y la sección "Sobre mí" en ambos idiomas
            </p>
          </div>

          {/* Language tabs */}
          <div className="flex items-center gap-1 p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('es')}
              className={`px-3 py-1 rounded-md transition cursor-pointer ${
                activeTab === 'es' ? 'bg-white dark:bg-gray-700 shadow-xs font-bold' : 'text-gray-500'
              }`}
            >
              Español
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('en')}
              className={`px-3 py-1 rounded-md transition cursor-pointer ${
                activeTab === 'en' ? 'bg-white dark:bg-gray-700 shadow-xs font-bold' : 'text-gray-500'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {activeTab === 'es' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Resumen Corto (Header Principal - ES)
              </label>
              <textarea
                rows={2}
                value={summaryEs}
                onChange={(e) => setSummaryEs(e.target.value)}
                placeholder="Desarrollador Full-Stack apasionado por crear aplicaciones web resilientes..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Biografía Detallada (Sección "Sobre mí" - ES)
              </label>
              <textarea
                rows={5}
                value={descEs}
                onChange={(e) => setDescEs(e.target.value)}
                placeholder="Ingeniero de software especializado en ecosistemas web modernos..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-y"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Short Summary (Main Header - EN)
              </label>
              <textarea
                rows={2}
                value={summaryEn}
                onChange={(e) => setSummaryEn(e.target.value)}
                placeholder="Full-Stack Developer passionate about crafting resilient, high-performance web applications..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Detailed Biography ("About me" Section - EN)
              </label>
              <textarea
                rows={5}
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                placeholder="Software engineer specializing in modern web ecosystems, cloud computing..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-y"
              />
            </div>
          </div>
        )}
      </div>

      {/* Social Links Section */}
      <div className="bg-white dark:bg-[#161b22] rounded-3xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 space-y-6 shadow-xs">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
          <Link2 className="w-5 h-5 text-blue-600" />
          <span>Enlaces y Redes Sociales</span>
        </h3>

        {/* Add Link Form */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Título (Ej. GitHub, LinkedIn, Twitter)"
            value={newLinkTitle}
            onChange={(e) => setNewLinkTitle(e.target.value)}
            className="sm:w-1/3 px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <input
            type="url"
            placeholder="URL (https://...)"
            value={newLinkUrl}
            onChange={(e) => setNewLinkUrl(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            type="button"
            onClick={addLink}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar</span>
          </button>
        </div>

        {/* Links List */}
        <div className="space-y-2 pt-2">
          {links.map((link, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/50"
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold text-xs text-gray-900 dark:text-white">{link.title}</span>
                <span className="text-xs text-gray-400 truncate max-w-sm">{link.url}</span>
              </div>
              <button
                type="button"
                onClick={() => removeLink(idx)}
                className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Section */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition cursor-pointer flex items-center gap-2 active:scale-98 shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Guardando Cambios...' : 'Guardar Todo'}</span>
        </button>
      </div>
    </form>
  );
}
