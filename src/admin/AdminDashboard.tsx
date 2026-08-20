import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useData } from '../context/DataContext';

export const AdminDashboard: React.FC = () => {
  const { logout, isAdminMode, setIsAdminMode } = useAdmin();
  const { settings, updateSetting } = useData();
  
  const [savingContacts, setSavingContacts] = useState(false);
  const [contacts, setContacts] = useState({
    contactEmail: settings.contactEmail || 'hello@artavenue.com',
    contactAddress: settings.contactAddress || 'Москва, Кутузовский пр-т, 12',
    linkBehance: settings.linkBehance || 'https://behance.net',
    linkInstagram: settings.linkInstagram || 'https://instagram.com',
    linkVimeo: settings.linkVimeo || 'https://vimeo.com',
  });

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContacts(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveContacts = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContacts(true);
    for (const [key, value] of Object.entries(contacts)) {
      if (settings[key] !== value) {
        await updateSetting(key, value);
      }
    }
    setSavingContacts(false);
    alert('Контакты сохранены!');
  };

  return (
    <div className="min-h-screen bg-[#121414] text-white p-8 font-['Inter'] pb-20">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-bold">Панель управления</h1>
            <p className="text-[#c4c7c7]">Управление сайтом Art Avenue Studio</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
            >
              Перейти на сайт
            </button>
            <button 
              onClick={logout}
              className="px-4 py-2 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg transition-colors"
            >
              Выйти
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1a1c1c] p-6 rounded-xl border border-white/10 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold mb-4">Режим редактирования контента</h2>
              <p className="text-[#c4c7c7] text-sm mb-6">
                Включите этот режим и перейдите на главную страницу. Вы сможете кликать на тексты для их моментального изменения прямо на странице, а также редактировать карточки проектов и менять картинки.
              </p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer bg-white/5 p-4 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
              <input 
                type="checkbox" 
                checked={isAdminMode} 
                onChange={(e) => setIsAdminMode(e.target.checked)}
                className="w-5 h-5 rounded border-white/20 accent-[#4b8eff]"
              />
              <span className="font-semibold">Включить Admin Mode</span>
            </label>
          </div>

          <div className="bg-[#1a1c1c] p-6 rounded-xl border border-white/10 row-span-2">
            <h2 className="text-xl font-bold mb-4">Управление контактами и ссылками</h2>
            <p className="text-[#c4c7c7] text-sm mb-6">
              Измените контактную информацию и ссылки на социальные сети, отображаемые в подвале сайта.
            </p>
            
            <form onSubmit={handleSaveContacts} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#c4c7c7] mb-1">Email</label>
                <input type="email" name="contactEmail" value={contacts.contactEmail} onChange={handleContactChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white focus:border-[#4b8eff] outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#c4c7c7] mb-1">Адрес</label>
                <input type="text" name="contactAddress" value={contacts.contactAddress} onChange={handleContactChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white focus:border-[#4b8eff] outline-none transition-colors" />
              </div>
              <div className="pt-2 border-t border-white/10 mt-4">
                <label className="block text-xs uppercase tracking-widest text-[#c4c7c7] mb-1 mt-2">Ссылка Behance</label>
                <input type="url" name="linkBehance" value={contacts.linkBehance} onChange={handleContactChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white focus:border-[#4b8eff] outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#c4c7c7] mb-1">Ссылка Instagram</label>
                <input type="url" name="linkInstagram" value={contacts.linkInstagram} onChange={handleContactChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white focus:border-[#4b8eff] outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#c4c7c7] mb-1">Ссылка Vimeo</label>
                <input type="url" name="linkVimeo" value={contacts.linkVimeo} onChange={handleContactChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm text-white focus:border-[#4b8eff] outline-none transition-colors" />
              </div>
              
              <button 
                type="submit" 
                disabled={savingContacts}
                className="w-full mt-4 bg-[#4b8eff] text-black font-bold py-3 rounded hover:brightness-110 transition-all disabled:opacity-50"
              >
                {savingContacts ? 'Сохранение...' : 'Сохранить контакты'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
