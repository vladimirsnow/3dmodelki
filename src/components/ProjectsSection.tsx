import React, { useState } from 'react';
import { Project } from '../types';
import { useData } from '../context/DataContext';
import { useAdmin } from '../context/AdminContext';
import { AdminCardEditor } from '../admin/AdminCardEditor';
import { EditableText } from './EditableText';

interface ProjectsSectionProps {
  onSelectProject: (project: Project) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ onSelectProject }) => {
  const [activeCategory, setActiveCategory] = useState<string>('Все');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  const { projects, settings, updateSetting } = useData();
  const { isAdminMode } = useAdmin();

  const categoriesStr = settings.projectFilters || 'Все,Интерьеры,Game Dev,Hard Surface,Unreal Engine 5,Архитектура';
  const categories = categoriesStr.split(',').map(c => c.trim()).filter(Boolean);

  const filteredProjects = activeCategory === 'Все'
    ? projects
    : projects.filter(p => p.category === activeCategory || p.tags.includes(activeCategory));

  return (
    <section id="portfolio" className="flex flex-col space-y-8 max-w-[1440px] mx-auto px-5 md:px-16 pt-12 relative">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <EditableText
            tag="h2"
            className="text-2xl md:text-3xl font-bold text-[#e2e2e2] font-['Inter']"
            value={settings.projectsTitle || 'Избранные проекты'}
            onSave={async (val) => await updateSetting('projectsTitle', val)}
          />
          <div className="mt-1">
            <EditableText
              tag="p"
              className="text-sm text-[#c4c7c7] max-w-2xl"
              multiline
              value={settings.projectsSubtitle || 'Исследуйте наши последние работы в области архитектурной визуализации и создания игровых миров.'}
              onSave={async (val) => await updateSetting('projectsSubtitle', val)}
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-col md:flex-row gap-2 pt-2 md:pt-0 items-start md:items-center">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                  activeCategory === category
                    ? 'bg-[#4b8eff] text-[#00285c] shadow-md'
                    : 'bg-[#282a2b] text-[#c4c7c7] hover:text-white hover:bg-[#333535] border border-white/5'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          {isAdminMode && (
            <div className="text-xs text-[#c4c7c7] bg-white/5 p-2 rounded flex items-center gap-2 mt-2 md:mt-0 border border-white/10">
              <span className="material-symbols-outlined text-[14px]">edit</span>
              <EditableText
                tag="span"
                className="font-mono text-[10px]"
                value={categoriesStr}
                onSave={async (val) => await updateSetting('projectFilters', val)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        {filteredProjects.map((project) => (
          <div key={project.id} className="relative group">
            {isAdminMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingProject(project);
                }}
                className="absolute top-4 right-4 z-10 bg-[#4b8eff] text-black w-10 h-10 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
                title="Редактировать карточку"
              >
                <span className="material-symbols-outlined text-lg">edit</span>
              </button>
            )}
            <div
              onClick={() => onSelectProject(project)}
              className="relative rounded-2xl overflow-hidden bg-[#1e2020] shadow-2xl border border-white/5 cursor-pointer transition-all hover:border-white/20"
            >
              {/* Project Image Box */}
              <div
                className="aspect-[4/3] w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('${project.imageUrl}')` }}
              ></div>

              {/* Gradient Mask */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#121414] via-[#121414]/40 to-transparent pointer-events-none opacity-90"></div>

              {/* Card Content Overlay */}
              <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                <div className="flex flex-col items-start gap-4">
                  {/* Category Tags */}
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-[#121414]/80 backdrop-blur-md rounded border border-white/10 text-[10px] font-semibold text-[#e2e2e2] uppercase tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Title & Short Description */}
                  <div>
                    <h3 className="text-xl md:text-2xl text-[#e2e2e2] font-semibold mb-2 group-hover:text-[#adc6ff] transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-[#c4c7c7] line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Learn More Trigger */}
                  <div className="inline-flex items-center gap-2 mt-2 text-xs font-semibold uppercase tracking-widest text-[#adc6ff] group-hover:text-white transition-colors">
                    <span>ПОДРОБНЕЕ</span>
                    <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingProject && (
        <AdminCardEditor project={editingProject} onClose={() => setEditingProject(null)} />
      )}
    </section>
  );
};
