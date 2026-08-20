import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, Service, TechItem } from '../types';

interface DataContextType {
  settings: Record<string, string>;
  projects: Project[];
  services: Service[];
  techStack: TechItem[];
  loading: boolean;
  updateSetting: (key: string, value: string) => Promise<boolean>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<boolean>;
  refetch: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [techStack, setTechStack] = useState<TechItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [setRes, projRes, servRes, techRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/projects'),
        fetch('/api/services'),
        fetch('/api/tech_stack')
      ]);

      setSettings(await setRes.json());
      setProjects(await projRes.json());
      setServices(await servRes.json());
      setTechStack(await techRes.json());
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateSetting = async (key: string, value: string) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value })
      });
      if (res.ok) {
        setSettings(prev => ({ ...prev, [key]: value }));
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };
  
  const updateProject = async (id: string, updates: Partial<Project>) => {
      try {
          const res = await fetch(`/api/projects/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updates)
          });
          if (res.ok) {
              setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
              return true;
          }
      } catch (err) {
          console.error(err);
      }
      return false;
  };

  return (
    <DataContext.Provider value={{ settings, projects, services, techStack, loading, refetch: fetchData, updateSetting, updateProject }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
