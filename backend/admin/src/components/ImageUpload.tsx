import { useState, useRef } from 'react';
import api from '../api';

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
}

export default function ImageUpload({ value, onChange, multiple = true }: Props) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList) => {
    setUploading(true);
    const urls: string[] = [...value];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('image', file);
      try {
        const r = await api.post('/admin/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        urls.push(r.data.url);
      } catch (e) {
        console.error('Upload failed:', e);
      }
    }
    onChange(urls);
    setUploading(false);
  };

  const remove = (url: string) => {
    onChange(value.filter((u) => u !== url));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {value.map((url) => (
          <div key={url} className="relative group">
            <img src={url} alt="" className="w-24 h-24 object-cover rounded border" />
            <button
              type="button"
              onClick={() => remove(url)}
              className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
        {(multiple || value.length === 0) && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 hover:border-primary-800 hover:text-primary-800 transition-colors"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-800"></div>
            ) : (
              <>
                <span className="text-2xl">+</span>
                <span className="text-xs mt-1">Subir</span>
              </>
            )}
          </button>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => e.target.files && upload(e.target.files)}
      />
    </div>
  );
}
