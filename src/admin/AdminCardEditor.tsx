import React, { useState } from 'react';
import { Project } from '../types';
import { useData } from '../context/DataContext';

interface AdminCardEditorProps {
  project: Project;
  onClose: () => void;
}

export const AdminCardEditor: React.FC<AdminCardEditorProps> = ({ project, onClose }) => {
  const { updateProject } = useData();
  const [formData, setFormData] = useState<Project>(project);
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      specs: { ...prev.specs, [name]: value }
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof Project) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const body = new FormData();
    body.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData(prev => ({ ...prev, [fieldName]: data.url }));
      } else {
        alert('Upload failed');
      }
    } catch (err) {
      alert('Upload failed');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const success = await updateProject(project.id, formData);
    setSaving(false);
    if (success) {
      onClose();
    } else {
      alert('Failed to save project');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#1e2020] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
        <h2 className="text-2xl font-bold text-white mb-6">Редактирование карточки проекта</h2>
        
        <form onSubmit={handleSave} className="space-y-6 text-sm text-[#c4c7c7]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Заголовок</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
              </div>
              <div>
                <label className="block mb-1">Подзаголовок</label>
                <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
              </div>
              <div>
                <label className="block mb-1">Категория</label>
                <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
              </div>
              <div>
                <label className="block mb-1">Краткое описание</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white h-24" />
              </div>
              <div>
                <label className="block mb-1">Полное описание (в модалке)</label>
                <textarea name="fullDescription" value={formData.fullDescription} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white h-32" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-1">Изображение (URL)</label>
                <div className="flex gap-2">
                  <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
                  <label className="bg-[#4b8eff] text-black px-4 py-2 rounded cursor-pointer font-semibold whitespace-nowrap">
                    Загрузить
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'imageUrl')} />
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block mb-1">3D Модель (URL - GLB/GLTF)</label>
                <div className="flex gap-2">
                  <input type="text" name="modelUrl" value={formData.modelUrl || ''} onChange={handleChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
                  <label className="bg-[#4b8eff] text-black px-4 py-2 rounded cursor-pointer font-semibold whitespace-nowrap">
                    Загрузить
                    <input type="file" accept=".glb,.gltf" className="hidden" onChange={(e) => handleFileUpload(e, 'modelUrl')} />
                  </label>
                </div>
              </div>

              <div className="border border-white/10 p-4 rounded-lg bg-black/20 mt-4 space-y-4">
                <h3 className="text-white font-bold mb-2">Технические характеристики</h3>
                <div>
                  <label className="block mb-1">Полигонаж</label>
                  <input type="text" name="polygons" value={formData.specs.polygons} onChange={handleSpecsChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
                </div>
                <div>
                  <label className="block mb-1">Движок / Пайплайн</label>
                  <input type="text" name="engine" value={formData.specs.engine} onChange={handleSpecsChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
                </div>
                <div>
                  <label className="block mb-1">Время рендера</label>
                  <input type="text" name="renderTime" value={formData.specs.renderTime} onChange={handleSpecsChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
                </div>
                <div>
                  <label className="block mb-1">Год</label>
                  <input type="text" name="year" value={formData.specs.year} onChange={handleSpecsChange} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded border border-white/20 hover:bg-white/5">Отмена</button>
            <button type="submit" disabled={saving} className="px-6 py-2 rounded bg-[#4b8eff] text-black font-bold hover:brightness-110">
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
