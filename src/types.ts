export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  fullDescription: string;
  category: 'Интерьеры' | 'Game Dev' | 'Hard Surface' | 'Unreal Engine 5' | 'Архитектура';
  tags: string[];
  imageUrl: string;
  secondaryImageUrl?: string;
  wireframeUrl?: string;
  modelUrl?: string;
  specs: {
    software: string[];
    polygons: string;
    renderTime: string;
    engine: string;
    year: string;
    client?: string;
  };
  featured?: boolean;
}

export interface Service {
  id: string;
  icon: string;
  title: string;
  description: string;
  features: string[];
  startingPrice: string;
  estimatedDays: string;
}

export interface TechItem {
  name: string;
  percentage: number;
  icon?: string;
  description: string;
}

export interface InquiryForm {
  name: string;
  email: string;
  phone?: string;
  serviceType: string;
  budget: string;
  details: string;
}
