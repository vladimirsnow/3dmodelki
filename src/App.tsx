import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProjectsSection } from './components/ProjectsSection';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { TechStackSection } from './components/TechStackSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Project } from './types';

export default function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [inquiryService, setInquiryService] = useState<string>('');
  const [inquiryBudget, setInquiryBudget] = useState<string>('');
  const [inquiryDetails, setInquiryDetails] = useState<string>('');

  const handleScrollToContact = () => {
    const el = document.getElementById('footer-contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#121414] text-[#e2e2e2] flex flex-col font-['Inter',sans-serif]">
      {/* Header Bar */}
      <Header
        onOpenContactModal={handleScrollToContact}
        activeSection="portfolio"
      />

      {/* Main Content Area */}
      <main className="w-full pt-20 bg-[#121414] space-y-12">
        {/* Hero Banner */}
        <Hero
          onExploreProjects={() => {
            const el = document.getElementById('portfolio');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Featured Projects Gallery */}
        <ProjectsSection
          onSelectProject={(project) => setSelectedProject(project)}
        />

        {/* Software & Tech Stack Showcase with Interactive 3D Viewport 2.0 */}
        <TechStackSection />

        {/* About Lumina Studio & Production Pipeline */}
        <AboutSection />
      </main>

      {/* Contact Section & Footer */}
      <ContactSection
        initialService={inquiryService}
        initialBudget={inquiryBudget}
        initialDetails={inquiryDetails}
      />

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onSelectForInquiry={(projectTitle) => {
          setInquiryService(`Проект "${projectTitle}"`);
          handleScrollToContact();
        }}
      />
    </div>
  );
}
