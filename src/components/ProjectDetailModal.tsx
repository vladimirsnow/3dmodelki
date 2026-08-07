import React, { useState } from 'react';
import { Project } from '../types';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  onSelectForInquiry: (projectTitle: string) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onSelectForInquiry,
}) => {
  if (!project) return null;

  const [activeTab, setActiveTab] = useState<'render' | 'secondary' | 'spec'>('render');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#1e2020] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col">
        {/* Header bar */}
        <div className="sticky top-0 z-20 bg-[#1e2020]/95 backdrop-blur-md px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-[#282a2b] border border-white/10 rounded text-xs font-semibold text-[#adc6ff]">
              {project.category}
            </span>
            <h3 className="text-xl font-bold text-white truncate max-w-md">{project.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal content body */}
        <div className="p-6 space-y-6">
          {/* Main Media Showcase */}
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-white/10 group">
            <img
              src={
                activeTab === 'secondary' && project.secondaryImageUrl
                  ? project.secondaryImageUrl
                  : project.imageUrl
              }
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500"
            />

            {/* Media View Selector Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-[#121414]/80 backdrop-blur-md p-2 rounded-lg border border-white/10">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('render')}
                  className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                    activeTab === 'render'
                      ? 'bg-[#4b8eff] text-[#00285c]'
                      : 'bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  Рендер 4K
                </button>
                {project.secondaryImageUrl && (
                  <button
                    onClick={() => setActiveTab('secondary')}
                    className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
                      activeTab === 'secondary'
                        ? 'bg-[#4b8eff] text-[#00285c]'
                        : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    Доп. Ракурс
                  </button>
                )}
              </div>

              <div className="text-[11px] text-[#c4c7c7] font-mono hidden sm:block">
                {project.specs.engine}
              </div>
            </div>
          </div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Description Column */}
            <div className="md:col-span-2 space-y-4">
              <h4 className="text-lg font-semibold text-white">О проекте</h4>
              <p className="text-sm text-[#c4c7c7] leading-relaxed">
                {project.fullDescription || project.description}
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {project.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded bg-[#282a2b] border border-white/10 text-xs text-[#e2e2e2]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Specs Sidebar Column */}
            <div className="bg-[#1a1c1c] p-5 rounded-xl border border-white/10 space-y-4">
              <h5 className="text-xs uppercase tracking-widest text-[#adc6ff] font-semibold">
                Технические характеристики
              </h5>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[#8e9192] block">Софт:</span>
                  <span className="text-white font-medium">
                    {project.specs.software.join(', ')}
                  </span>
                </div>

                <div>
                  <span className="text-[#8e9192] block">Полигонаж:</span>
                  <span className="text-white font-mono font-medium">{project.specs.polygons}</span>
                </div>

                <div>
                  <span className="text-[#8e9192] block">Время рендера:</span>
                  <span className="text-white font-medium">{project.specs.renderTime}</span>
                </div>

                <div>
                  <span className="text-[#8e9192] block">Движок / Пайплайн:</span>
                  <span className="text-white font-medium">{project.specs.engine}</span>
                </div>

                {project.specs.client && (
                  <div>
                    <span className="text-[#8e9192] block">Заказчик:</span>
                    <span className="text-white font-medium">{project.specs.client}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  onSelectForInquiry(project.title);
                  onClose();
                }}
                className="w-full mt-4 bg-[#4b8eff] text-[#00285c] py-3 rounded-lg font-semibold text-xs tracking-wider uppercase hover:brightness-110 transition-all text-center cursor-pointer"
              >
                Заказать похожий проект
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
