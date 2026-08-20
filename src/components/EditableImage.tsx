import React, { useState, useRef } from 'react';
import { useAdmin } from '../context/AdminContext';

interface EditableImageProps {
  src: string;
  alt: string;
  onSave: (newUrl: string) => Promise<boolean>;
  className?: string;
  containerClassName?: string;
}

export const EditableImage: React.FC<EditableImageProps> = ({ src, alt, onSave, className = '', containerClassName = '' }) => {
  const { isAdminMode } = useAdmin();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAdminMode) {
    return <img src={src} alt={alt} className={className} />;
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (res.ok && data.url) {
        await onSave(data.url);
      } else {
        alert('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Upload failed due to network error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative group inline-block ${containerClassName}`}>
      <img src={src} alt={alt} className={className} />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-[#4b8eff] text-black px-4 py-2 rounded-lg font-bold hover:brightness-110 shadow-lg flex items-center gap-2"
        >
          <span className="material-symbols-outlined">image</span>
          {uploading ? 'Загрузка...' : 'Заменить изображение'}
        </button>
      </div>
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleUpload} 
        className="hidden" 
      />
    </div>
  );
};
