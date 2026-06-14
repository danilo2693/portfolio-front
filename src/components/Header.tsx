import { useState, useEffect } from "react";
import { Moon, Sun, Monitor, Globe, BriefcaseBusiness, FolderGit2, User, Mail, Menu, X } from "lucide-react";

const navLinks = {
  en: [
    { icon: BriefcaseBusiness, name: "Experience", href: "#experience" },
    { icon: FolderGit2, name: "Projects", href: "#projects" },
    { icon: User, name: "About me", href: "#about" },
    { icon: Mail, name: "Contact", href: "#contact" },
  ],
  es: [
    { icon: BriefcaseBusiness, name: "Experiencia", href: "#experience" },
    { icon: FolderGit2, name: "Proyectos", href: "#projects" },
    { icon: User, name: "Sobre mí", href: "#about" },
    { icon: Mail, name: "Contacto", href: "#contact" },
  ]
};

type Theme = 'light' | 'dark' | 'system';

export default function Header({ initialLang, isHome }: { initialLang: 'en' | 'es', isHome: boolean }) {
  const [activeId, setActiveId] = useState('');
  const [theme, setTheme] = useState<Theme>('system');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const links = navLinks[initialLang];

  useEffect(() => {
    // Sync initial theme
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) setTheme(stored);

    // Scroll event for glassy background
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Intersection Observer for active nav items
    const observers: IntersectionObserver[] = [];
    const ids = links.map(l => l.href.substring(1));

    const callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(callback, {
      rootMargin: '-50% 0px -50% 0px'
    });

    ids.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [links]);

  const cycleTheme = () => {
    const nextTheme: Record<Theme, Theme> = {
      light: 'dark',
      dark: 'system',
      system: 'light'
    };
    const newTheme = nextTheme[theme];
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', systemDark);
    } else {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  };

  const ThemeIcon = {
    light: Sun,
    dark: Moon,
    system: Monitor
  }[theme];

  const switchLanguage = () => {
    const nextLang = initialLang === 'en' ? 'es' : 'en';
    const url = new URL(window.location.href);
    url.searchParams.set('lang', nextLang);
    window.location.href = url.toString();
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/70 dark:bg-gray-950/70 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm'
        : 'bg-transparent'
        }`}
    >
      <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between md:justify-center">
        {/* Empty div for mobile flex balancing if needed, but we'll use justify-between on mobile */}
        <div className="md:hidden"></div>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-1 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-full backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
            {links.map((link) => {
              const isActive = activeId === link.href.substring(1);
              const IconComponent = link.icon;
              return (
                <a
                  key={link.name}
                  href={isHome ? link.href : `/?lang=${initialLang}${link.href}`}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 flex items-center gap-1.5 ${isActive
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                    }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{link.name}</span>
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={switchLanguage}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all flex items-center gap-1"
              aria-label="Switch Language"
            >
              <Globe className="w-5 h-5" />
              <span className="text-xs font-bold uppercase">{initialLang}</span>
            </button>
            <button
              onClick={cycleTheme}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
              aria-label="Toggle Theme"
            >
              <ThemeIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-4 shadow-lg animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-2">
            {links.map((link) => {
              const isActive = activeId === link.href.substring(1);
              const IconComponent = link.icon;
              return (
                <a
                  key={link.name}
                  href={isHome ? link.href : `/?lang=${initialLang}${link.href}`}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 text-sm font-medium rounded-xl flex items-center gap-3 transition-colors ${isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900'
                    }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{link.name}</span>
                </a>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
