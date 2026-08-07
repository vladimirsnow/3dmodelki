import React, { useState } from 'react';
import { Project } from '../types';
import { PROJECTS } from '../data/projects';

interface ProjectsSectionProps {
  onSelectProject: (project: Project) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ onSelectProject }) => {
  const [activeCategory, setActiveCategory] = useState<string>('Все');

  const categories = ['Все', 'Интерьеры', 'Game Dev', 'Hard Surface', 'Unreal Engine 5', 'Архитектура'];

  const filteredProjects = activeCategory === 'Все'
    ? PROJECTS
    : PROJECTS.filter(p => p.category === activeCategory || p.tags.includes(activeCategory));

  return (
    <section id="portfolio" className="flex flex-col space-y-8 max-w-[1440px] mx-auto px-5 md:px-16 pt-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#e2e2e2] font-['Inter']">
            Избранные проекты
          </h2>
          <p className="text-sm text-[#c4c7c7] max-w-2xl mt-1">
            Исследуйте наши последние работы в области архитектурной визуализации и создания игровых миров.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 pt-2 md:pt-0">
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
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => onSelectProject(project)}
            className="group relative rounded-2xl overflow-hidden bg-[#1e2020] shadow-2xl border border-white/5 cursor-pointer transition-all hover:border-white/20"
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
        ))}
      </div>
    </section>
  );
};
