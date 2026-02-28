import { useState } from 'react';

interface Props {
  label: string;
  nameEs: string;
  nameFr: string;
  valueEs: string;
  valueFr: string;
  onChange: (name: string, value: string) => void;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
}

export default function BilingualField({
  label, nameEs, nameFr, valueEs, valueFr, onChange, multiline, rows = 3, required,
}: Props) {
  const [lang, setLang] = useState<'es' | 'fr'>('es');

  const currentName = lang === 'es' ? nameEs : nameFr;
  const currentValue = lang === 'es' ? valueEs : valueFr;

  const handleChange = (val: string) => {
    onChange(currentName, val);
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex border border-gray-300 rounded overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => setLang('es')}
            className={`px-3 py-1 transition-colors ${lang === 'es' ? 'bg-primary-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            ES
          </button>
          <button
            type="button"
            onClick={() => setLang('fr')}
            className={`px-3 py-1 transition-colors ${lang === 'fr' ? 'bg-primary-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            FR
          </button>
        </div>
      </div>
      {multiline ? (
        <textarea
          name={currentName}
          value={currentValue}
          onChange={(e) => handleChange(e.target.value)}
          rows={rows}
          required={required && lang === 'es'}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
        />
      ) : (
        <input
          type="text"
          name={currentName}
          value={currentValue}
          onChange={(e) => handleChange(e.target.value)}
          required={required && lang === 'es'}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-800"
        />
      )}
      <p className="text-xs text-gray-400 mt-1">Editando en: {lang === 'es' ? 'Español 🇪🇸' : 'Français 🇫🇷'}</p>
    </div>
  );
}
