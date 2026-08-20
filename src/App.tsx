import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProjectsSection } from './components/ProjectsSection';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { TechStackSection } from './components/TechStackSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Project } from './types';
import { useAdmin } from './context/AdminContext';
import { AdminLogin } from './admin/AdminLogin';
import { AdminDashboard } from './admin/AdminDashboard';

export default function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [inquiryService, setInquiryService] = useState<string>('');
  const [inquiryBudget, setInquiryBudget] = useState<string>('');
  const [inquiryDetails, setInquiryDetails] = useState<string>('');
  
  const { isAdmin, isAdminMode } = useAdmin();
  const path = window.location.pathname;

  if (path === '/admin') {
    return isAdmin ? <AdminDashboard /> : <AdminLogin />;
  }

  const handleScrollToContact = () => {
    const el = document.getElementById('footer-contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#121414] text-[#e2e2e2] flex flex-col font-['Inter',sans-serif]">
      {/* Admin Mode Badge */}
      {isAdminMode && (
        <div className="fixed top-4 left-4 z-[100] bg-[#4b8eff] text-black font-bold px-4 py-2 rounded-lg shadow-2xl flex items-center gap-4 animate-in slide-in-from-top border border-black/20">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
            ADMIN MODE
          </span>
          <div className="flex gap-2">
            <a href="/admin" className="text-xs bg-black/10 px-2 py-1 rounded hover:bg-black/20">Dashboard</a>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <Header
        onOpenContactModal={handleScrollToContact}
        activeSection="portfolio"
      />

      {/* Main Content Area */}
      <main className="w-full pt-20 bg-[#121414] space-y-12 relative">
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
