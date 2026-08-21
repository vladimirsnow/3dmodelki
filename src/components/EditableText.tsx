import React, { useState, useRef, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';

interface EditableTextProps {
  value: string;
  onSave: (newVal: string) => Promise<boolean>;
  tag?: keyof React.JSX.IntrinsicElements;
  className?: string;
  multiline?: boolean;
}

export const EditableText: React.FC<EditableTextProps> = ({ 
  value, 
  onSave, 
  tag: Tag = 'span', 
  className = '', 
  multiline = false 
}) => {
  const { isAdminMode } = useAdmin();
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [saving, setSaving] = useState(false);
  const contentEditableRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && contentEditableRef.current) {
      contentEditableRef.current.focus();
    }
  }, [isEditing]);

  // If not admin mode, just render the normal tag
  if (!isAdminMode) {
    return <Tag className={className} dangerouslySetInnerHTML={{ __html: value.replace(/\n/g, '<br/>') }} />;
  }

  const handleSave = async () => {
    if (contentEditableRef.current) {
      const newVal = contentEditableRef.current.innerText || '';
      if (newVal !== value) {
        setSaving(true);
        const success = await onSave(newVal);
        setSaving(false);
        if (success) {
          setIsEditing(false);
        } else {
          alert('Failed to save changes');
        }
      } else {
        setIsEditing(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      if (contentEditableRef.current) {
        contentEditableRef.current.innerText = value;
      }
    }
  };

  return (
    <div className={`relative group inline-block ${className} ${isEditing ? 'ring-2 ring-[#4b8eff] rounded p-1 -m-1' : ''}`} style={isEditing ? { backgroundColor: 'rgba(0,0,0,0.5)' } : {}}>
      <Tag
        ref={contentEditableRef as any}
        contentEditable={isEditing && !saving}
        suppressContentEditableWarning
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`${className} outline-none ${isEditing ? 'cursor-text' : ''}`}
        style={{ whiteSpace: multiline ? 'pre-wrap' : 'normal', minWidth: '20px' }}
        dangerouslySetInnerHTML={{ __html: isEditing ? tempValue : tempValue.replace(/\n/g, '<br/>') }}
      />
      {!isEditing && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); }}
          className="absolute -top-3 -right-6 opacity-0 group-hover:opacity-100 bg-[#4b8eff] text-black rounded-full p-1 shadow-lg transition-opacity z-10 hover:scale-110 flex items-center justify-center cursor-pointer"
          title="Edit text"
        >
          <span className="material-symbols-outlined text-[14px]">edit</span>
        </button>
      )}
      {saving && (
        <span className="absolute -top-3 -right-6 bg-green-500 text-white text-[10px] px-1 rounded z-20">
          ...
        </span>
      )}
    </div>
  );
};
