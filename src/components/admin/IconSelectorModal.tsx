import { useState, useEffect } from 'react';
import { Search, X, Sparkles, Loader2, Check } from 'lucide-react';

export interface SelectedIcon {
  title: string;
  iconUrl: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (icon: SelectedIcon) => void;
}

const POPULAR_QUICK_SEARCH = [
  'React',
  'TypeScript',
  'JavaScript',
  'Next.js',
  'Svelte',
  'Angular',
  'Tailwind CSS',
  'Node.js',
  'Python',
  'Java',
  'Docker',
  'Git',
  'GitHub',
  'GraphQL',
  'PostgreSQL',
  'MongoDB',
  'Firebase',
  'Azure',
  'Storybook',
  'Zustand',
];

export default function IconSelectorModal({ isOpen, onClose, onSelectIcon }: Props) {
  const [search, setSearch] = useState('');
  const [icons, setIcons] = useState<{ id: number; title: string; iconUrl: string; category: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [selectedIconItem, setSelectedIconItem] = useState<{ title: string; iconUrl: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const queryParam = search.trim() ? `?q=${encodeURIComponent(search.trim())}&limit=60` : '?limit=60';
        const res = await fetch(`/api/admin/icons${queryParam}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setIcons(data.icons);
        }
      } catch (err) {
        console.error('Error fetching icons:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [isOpen, search]);

  if (!isOpen) return null;

  const handleChoose = (item: { title: string; iconUrl: string }) => {
    setSelectedIconItem(item);
    setCustomTitle(item.title);
  };

  const handleConfirm = () => {
    if (!selectedIconItem) return;
    onSelectIcon({
      title: customTitle.trim() || selectedIconItem.title,
      iconUrl: selectedIconItem.iconUrl,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 max-h-[85vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Selector de Tecnologías (SVGL)
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Selecciona cualquier logotipo oficial sin tener que copiar código SVG
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar tecnología o herramienta (ej. React, TypeScript, Docker, Svelte)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Quick Search Chips */}
        <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto scrollbar-none">
          {POPULAR_QUICK_SEARCH.map((tech) => (
            <button
              key={tech}
              type="button"
              onClick={() => setSearch(tech)}
              className="px-2.5 py-1 rounded-lg text-xs bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 text-gray-600 dark:text-gray-300 font-medium transition cursor-pointer"
            >
              {tech}
            </button>
          ))}
        </div>

        {/* Icons Grid */}
        <div className="flex-1 overflow-y-auto min-h-[260px] max-h-[340px] pr-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-xs font-medium">Buscando iconos en SVGL...</span>
            </div>
          ) : icons.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-1 text-gray-400">
              <span className="text-sm font-medium">No se encontraron iconos para "{search}"</span>
              <span className="text-xs">Prueba con el nombre en inglés o agrega el tag manualmente.</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {icons.map((item) => {
                const isSelected = selectedIconItem?.iconUrl === item.iconUrl;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleChoose(item)}
                    className={`p-3 rounded-xl border text-left flex items-center gap-3 transition cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                        : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-[#161b22]'
                    }`}
                  >
                    <div className="w-7 h-7 shrink-0 rounded-lg bg-gray-50 dark:bg-gray-800 p-1 flex items-center justify-center border border-gray-100 dark:border-gray-700">
                      <img
                        src={item.iconUrl}
                        alt={item.title}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-gray-900 dark:text-white truncate">
                        {item.title}
                      </span>
                      <span className="block text-[10px] text-gray-400 truncate">
                        {item.category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected preview & confirm bar */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {selectedIconItem ? (
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 p-1.5 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                <img
                  src={selectedIconItem.iconUrl}
                  alt={selectedIconItem.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Nombre de la tecnología"
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 flex-1 max-w-xs"
              />
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">
              Haz clic en cualquier tecnología para seleccionarla
            </span>
          )}

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-medium transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedIconItem}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Usar esta Tecnología</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
