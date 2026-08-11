import React, { useState, useEffect, useRef } from 'react';
import { STUDIO_LOGO } from '../data/projects';

interface HeaderProps {
  onOpenContactModal: () => void;
  activeSection?: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenContactModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentSection, setCurrentSection] = useState<string>('portfolio');
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  const navRef = useRef<HTMLElement | null>(null);
  const navItemRefs = useRef<{ [key: string]: HTMLAnchorElement | null }>({});

  const navLinks = [
    { id: 'portfolio', label: 'Работы', href: '#portfolio' },
    { id: 'tech-stack', label: 'Стек', href: '#tech-stack' },
    { id: 'about', label: 'О нас', href: '#about' },
    { id: 'contacts', label: 'Контакты', href: '#footer-contact' },
  ];

  // Scroll position & active section detector
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sectionIds = ['portfolio', 'tech-stack', 'about', 'footer-contact'];
      const scrollPosition = window.scrollY + 200;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setCurrentSection(id === 'footer-contact' ? 'contacts' : id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial active calculation
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update underline indicator position
  useEffect(() => {
    const activeEl = navItemRefs.current[currentSection];
    if (activeEl && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const itemRect = activeEl.getBoundingClientRect();
      setIndicatorStyle({
        left: itemRect.left - navRect.left,
        width: itemRect.width,
      });
    }
  }, [currentSection]);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-[#121414]/90 backdrop-blur-xl border-b border-white/10 shadow-xl' : 'bg-[#121414]/80 backdrop-blur-xl border-b border-white/5'
    }`}>
      <div className="h-20 max-w-[1440px] mx-auto px-5 md:px-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <a href="#" className="flex items-center gap-3 group">
          <img 
            src={STUDIO_LOGO} 
            alt="Art avenue Logo" 
            className="h-8 w-auto object-contain rounded-sm transition-transform duration-300 group-hover:scale-105"
          />
          <span className="font-semibold text-xl tracking-tight text-[#e2e2e2] hidden sm:block font-['Inter']">
            Art avenue
          </span>
        </a>

        {/* Desktop Navigation with Moving Active Underline Indicator */}
        <nav ref={navRef} className="relative hidden md:flex items-center gap-10 text-xs uppercase tracking-widest text-[#c4c7c7] py-2">
          {navLinks.map((link) => {
            const isActive = currentSection === link.id;
            return (
              <a
                key={link.id}
                ref={(el) => (navItemRefs.current[link.id] = el)}
                href={link.href}
                onClick={() => setCurrentSection(link.id)}
                className={`transition-colors duration-200 py-1 hover:text-white ${
                  isActive ? 'text-white font-bold' : ''
                }`}
              >
                {link.label}
              </a>
            );
          })}

          {/* Smooth Sliding Highlight Line */}
          <div
            className="absolute bottom-0 h-0.5 bg-[#4b8eff] shadow-[0_0_10px_#4b8eff] transition-all duration-300 ease-out rounded-full pointer-events-none"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
              opacity: indicatorStyle.width ? 1 : 0,
            }}
          />
        </nav>

        {/* Action Controls (Avatar Removed) */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={onOpenContactModal}
            className="hidden sm:inline-flex bg-[#4b8eff] text-[#00285c] px-6 py-3 rounded-lg font-semibold text-xs tracking-wider uppercase hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            Заказать проект
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#e2e2e2] hover:text-white rounded-lg bg-white/5 border border-white/10 cursor-pointer"
            aria-label="Toggle Navigation"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1a1c1c] border-b border-white/10 px-6 py-6 flex flex-col gap-4 animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              onClick={() => {
                setCurrentSection(link.id);
                setMobileMenuOpen(false);
              }}
              className={`text-sm font-medium py-2 border-b border-white/5 uppercase tracking-wider flex items-center justify-between ${
                currentSection === link.id ? 'text-[#4b8eff] font-bold' : 'text-[#e2e2e2] hover:text-[#4b8eff]'
              }`}
            >
              <span>{link.label}</span>
              {currentSection === link.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#4b8eff] shadow-[0_0_6px_#4b8eff]"></span>
              )}
            </a>
          ))}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenContactModal();
            }}
            className="w-full mt-2 bg-[#4b8eff] text-[#00285c] py-3 rounded-lg font-semibold text-xs tracking-wider uppercase hover:brightness-110"
          >
            Заказать проект
          </button>
        </div>
      )}
    </header>
  );
};

