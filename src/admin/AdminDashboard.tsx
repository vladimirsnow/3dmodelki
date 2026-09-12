import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useData } from '../context/DataContext';

type ShowcaseService = {
  id: string;
  title: string;
  description: string;
  icon: 'box' | 'house' | 'sparkles' | 'clapperboard';
  price: string;
};

const defaultShowcaseServices: ShowcaseService[] = [
  { id: 'product', title: '3D-моделирование продуктов', description: 'Предметные модели для каталогов, маркетплейсов, презентаций и рекламы.', icon: 'box', price: 'от 25 000 ₽' },
  { id: 'architecture', title: 'Архитектурная визуализация', description: 'Интерьеры, экстерьеры и атмосферные ракурсы, которые продают идею до строительства.', icon: 'house', price: 'от 1 500 ₽ / м²' },
  { id: 'game', title: 'Игровые ассеты', description: 'Оптимизированные модели, окружение и материалы для Unity, Unreal Engine и модов.', icon: 'sparkles', price: 'от 18 000 ₽' },
  { id: 'animation', title: '3D-анимация и ролики', description: 'Динамичные продуктовые ролики, заставки и визуальные истории для брендов.', icon: 'clapperboard', price: 'от 40 000 ₽' },
];

function readShowcaseServices(value?: string): ShowcaseService[] {
  if (!value) return defaultShowcaseServices;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.length ? parsed : defaultShowcaseServices;
  } catch {
    return defaultShowcaseServices;
  }
}

export const AdminDashboard: React.FC = () => {
  const { logout, isAdminMode, setIsAdminMode } = useAdmin();
  const { settings, updateSetting } = useData();
  
  const [savingContacts, setSavingContacts] = useState(false);
  const [showcaseServices, setShowcaseServices] = useState<ShowcaseService[]>(() => readShowcaseServices(settings.showcaseServicesData));
  const [modelUrl, setModelUrl] = useState(settings.showcaseModelUrl || 'https://modelviewer.dev/shared-assets/models/Astronaut.glb');
  const [savingShowcase, setSavingShowcase] = useState(false);
  const [uploadingModel, setUploadingModel] = useState(false);
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

  useEffect(() => {
    setShowcaseServices(readShowcaseServices(settings.showcaseServicesData));
  }, [settings.showcaseServicesData]);

  useEffect(() => {
    if (settings.showcaseModelUrl) setModelUrl(settings.showcaseModelUrl);
  }, [settings.showcaseModelUrl]);

  const updateShowcaseService = (index: number, field: keyof ShowcaseService, value: string) => {
    setShowcaseServices((current) => current.map((service, serviceIndex) => (
      serviceIndex === index ? { ...service, [field]: value } as ShowcaseService : service
    )));
  };

  const addShowcaseService = () => {
    setShowcaseServices((current) => [
      ...current,
      {
        id: `service-${Date.now()}`,
        title: 'Новая услуга',
        description: 'Кратко опишите, какую задачу решает эта услуга.',
        icon: 'box',
        price: 'от 0 ₽',
      },
    ]);
  };

  const removeShowcaseService = (index: number) => {
    setShowcaseServices((current) => current.filter((_, serviceIndex) => serviceIndex !== index));
  };

  const saveShowcase = async () => {
    setSavingShowcase(true);
    const [servicesSaved, modelSaved] = await Promise.all([
      updateSetting('showcaseServicesData', JSON.stringify(showcaseServices)),
      updateSetting('showcaseModelUrl', modelUrl.trim()),
    ]);
    setSavingShowcase(false);
    alert(servicesSaved && modelSaved ? 'Услуги и 3D-модель сохранены.' : 'Не удалось сохранить изменения.');
  };

  const uploadModel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingModel(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const payload = await response.json();
      if (!response.ok || !payload.url) throw new Error('Upload failed');
      setModelUrl(payload.url);
    } catch {
      alert('Не удалось загрузить модель. Используйте прямую ссылку на .glb или повторите загрузку.');
    } finally {
      setUploadingModel(false);
      event.target.value = '';
    }
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

        <section className="mt-6 border border-white/10 bg-[#1a1c1c] p-6">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">Услуги и 3D-сцена главной страницы</h2>
              <p className="mt-1 text-sm text-[#c4c7c7]">Здесь меняются карточки в блоке «Наши услуги» и модель в интерактивном окне.</p>
            </div>
            <button type="button" onClick={addShowcaseService} className="inline-flex items-center justify-center gap-2 border border-[#4b8eff]/50 px-4 py-2 text-sm text-[#adc6ff] hover:bg-[#4b8eff]/10">
              <Plus className="h-4 w-4" /> Добавить услугу
            </button>
          </div>

          <div className="space-y-4">
            {showcaseServices.map((service, index) => (
              <div key={service.id} className="grid gap-3 border border-white/10 bg-black/20 p-4 md:grid-cols-2">
                <input value={service.title} onChange={(event) => updateShowcaseService(index, 'title', event.target.value)} aria-label="Название услуги" className="bg-black/40 border border-white/10 p-2 text-sm text-white outline-none focus:border-[#4b8eff]" placeholder="Название услуги" />
                <div className="flex gap-3">
                  <input value={service.price} onChange={(event) => updateShowcaseService(index, 'price', event.target.value)} aria-label="Стоимость услуги" className="min-w-0 flex-1 bg-black/40 border border-white/10 p-2 text-sm text-white outline-none focus:border-[#4b8eff]" placeholder="Стоимость" />
                  <select value={service.icon} onChange={(event) => updateShowcaseService(index, 'icon', event.target.value)} aria-label="Иконка услуги" className="bg-black/40 border border-white/10 px-2 text-sm text-white outline-none focus:border-[#4b8eff]">
                    <option value="box">Продукт</option>
                    <option value="house">Архитектура</option>
                    <option value="sparkles">Game Dev</option>
                    <option value="clapperboard">Анимация</option>
                  </select>
                  <button type="button" onClick={() => removeShowcaseService(index)} className="border border-red-400/30 p-2 text-red-300 hover:bg-red-500/10" title="Удалить услугу" aria-label="Удалить услугу">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <textarea value={service.description} onChange={(event) => updateShowcaseService(index, 'description', event.target.value)} aria-label="Описание услуги" className="min-h-20 bg-black/40 border border-white/10 p-2 text-sm text-white outline-none focus:border-[#4b8eff] md:col-span-2" placeholder="Описание услуги" />
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-white/10 pt-6">
            <label className="mb-2 block text-sm font-semibold">3D-модель для окна</label>
            <p className="mb-3 text-xs text-[#c4c7c7]">Поддерживается ссылка или файл в формате GLB. После загрузки сохраните изменения.</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input type="url" value={modelUrl} onChange={(event) => setModelUrl(event.target.value)} className="min-w-0 flex-1 bg-black/40 border border-white/10 p-2 text-sm text-white outline-none focus:border-[#4b8eff]" placeholder="https://.../model.glb" />
              <label className="inline-flex cursor-pointer items-center justify-center gap-2 border border-white/15 px-4 py-2 text-sm hover:bg-white/5">
                <Upload className="h-4 w-4" /> {uploadingModel ? 'Загрузка...' : 'Загрузить GLB'}
                <input type="file" accept=".glb,model/gltf-binary" onChange={uploadModel} className="hidden" disabled={uploadingModel} />
              </label>
            </div>
          </div>

          <button type="button" onClick={saveShowcase} disabled={savingShowcase || uploadingModel} className="mt-6 w-full bg-[#4b8eff] py-3 font-bold text-[#00285c] hover:brightness-110 disabled:opacity-50">
            {savingShowcase ? 'Сохранение...' : 'Сохранить услуги и 3D-модель'}
          </button>
        </section>
      </div>
    </div>
  );
};
