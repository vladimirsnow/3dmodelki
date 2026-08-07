import React, { useState, useEffect } from 'react';
import { InquiryForm } from '../types';

interface ContactSectionProps {
  initialService?: string;
  initialBudget?: string;
  initialDetails?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  initialService,
  initialBudget,
  initialDetails,
}) => {
  const [formData, setFormData] = useState<InquiryForm>({
    name: '',
    email: '',
    phone: '',
    serviceType: initialService || '3D Дизайн интерьеров',
    budget: initialBudget || '',
    details: initialDetails || '',
  });

  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (initialService) {
      setFormData(prev => ({
        ...prev,
        serviceType: initialService,
        budget: initialBudget || prev.budget,
        details: initialDetails ? `${prev.details}\n\n${initialDetails}`.trim() : prev.details,
      }));
    }
  }, [initialService, initialBudget, initialDetails]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate server submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <footer className="w-full bg-[#1a1c1c] pt-24 pb-12 border-t border-white/10 mt-16" id="footer-contact">
      <div className="max-w-[1440px] mx-auto px-5 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 mb-16">
          {/* Contact Left Column */}
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-[#e2e2e2] leading-tight font-bold font-['Inter']">
              Давайте<br />создавать.
            </h2>

            <p className="text-[#c4c7c7] text-base md:text-lg max-w-md leading-relaxed">
              Превращаем архитектурные концепции в гиперреалистичный визуальный опыт. Обсудите ваш следующий проект с нашей командой.
            </p>

            <div className="space-y-6 pt-4">
              <a
                href="mailto:hello@lumina-studio.art"
                className="flex items-center gap-4 text-[#c4c7c7] hover:text-[#adc6ff] transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-[#1e2020] flex items-center justify-center group-hover:bg-[#4b8eff]/20 transition-colors border border-white/5">
                  <span className="material-symbols-outlined text-xl text-[#adc6ff]">mail</span>
                </div>
                <span className="text-base font-medium">hello@lumina-studio.art</span>
              </a>

              <div className="flex items-center gap-4 text-[#c4c7c7] hover:text-[#adc6ff] transition-colors group">
                <div className="w-12 h-12 rounded-full bg-[#1e2020] flex items-center justify-center group-hover:bg-[#4b8eff]/20 transition-colors border border-white/5">
                  <span className="material-symbols-outlined text-xl text-[#adc6ff]">location_on</span>
                </div>
                <span className="text-base font-medium">Москва, Кутузовский пр-т, 12</span>
              </div>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="bg-[#1e2020] p-6 md:p-10 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#4b8eff]/5 rounded-bl-full pointer-events-none"></div>

            {submitted ? (
              <div className="py-12 px-4 text-center space-y-4 animate-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 mx-auto flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl">check_circle</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Запрос успешно отправлен!</h3>
                <p className="text-sm text-[#c4c7c7] max-w-sm mx-auto">
                  Наш арт-директор свяжется с вами в течение 30 минут для уточнения деталей.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', serviceType: '3D Дизайн интерьеров', budget: '', details: '' });
                  }}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold uppercase tracking-wider text-white transition-colors cursor-pointer"
                >
                  Отправить еще один запрос
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                {formData.serviceType && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#4b8eff]/20 border border-[#4b8eff]/40 text-xs text-[#adc6ff] font-semibold">
                    <span className="material-symbols-outlined text-sm">label</span>
                    <span>Услуга: {formData.serviceType}</span>
                    {formData.budget && <span className="font-mono text-white">({formData.budget})</span>}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs text-[#c4c7c7] uppercase tracking-widest font-semibold block">
                    Имя
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Как к вам обращаться?"
                    className="w-full bg-[#333535] border border-white/10 p-4 rounded-xl text-[#e2e2e2] focus:ring-2 focus:ring-[#4b8eff]/50 focus:border-[#4b8eff] transition-all placeholder:text-[#c4c7c7]/50 outline-none text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-[#c4c7c7] uppercase tracking-widest font-semibold block">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ваша@почта.com"
                    className="w-full bg-[#333535] border border-white/10 p-4 rounded-xl text-[#e2e2e2] focus:ring-2 focus:ring-[#4b8eff]/50 focus:border-[#4b8eff] transition-all placeholder:text-[#c4c7c7]/50 outline-none text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-[#c4c7c7] uppercase tracking-widest font-semibold block">
                    Детали проекта
                  </label>
                  <textarea
                    rows={4}
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    placeholder="Расскажите немного о вашей задаче..."
                    className="w-full bg-[#333535] border border-white/10 p-4 rounded-xl text-[#e2e2e2] focus:ring-2 focus:ring-[#4b8eff]/50 focus:border-[#4b8eff] transition-all resize-none placeholder:text-[#c4c7c7]/50 outline-none text-sm"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#e2e2e2] text-[#121414] py-5 rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-[#4b8eff] hover:text-[#00285c] transition-all duration-300 shadow-lg mt-2 cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>ОТПРАВКА...</span>
                  ) : (
                    <>
                      <span>ОТПРАВИТЬ ЗАПРОС</span>
                      <span className="material-symbols-outlined text-lg">send</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer Sub-bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-t border-white/10 pt-8">
          <div className="text-xs text-[#c4c7c7] tracking-widest uppercase">
            © 2026 LUMINA STUDIO. ВСЕ ПРАВА ЗАЩИЩЕНЫ.
          </div>

          <div className="flex gap-8">
            <a
              href="https://behance.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#c4c7c7] hover:text-[#adc6ff] transition-colors tracking-widest uppercase"
            >
              BEHANCE
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#c4c7c7] hover:text-[#adc6ff] transition-colors tracking-widest uppercase"
            >
              INSTAGRAM
            </a>
            <a
              href="https://vimeo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#c4c7c7] hover:text-[#adc6ff] transition-colors tracking-widest uppercase"
            >
              VIMEO
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
