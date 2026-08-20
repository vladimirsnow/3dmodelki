import { useState, useEffect } from 'react';
import { Project, Service, TechItem } from '../types';

export const useData = () => {
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

  return { settings, projects, services, techStack, loading, refetch: fetchData, updateSetting, updateProject };
};
