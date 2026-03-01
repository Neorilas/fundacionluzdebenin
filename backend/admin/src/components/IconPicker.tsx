import { useState, useRef, useEffect } from 'react';

interface Props {
  value: string;
  onChange: (emoji: string) => void;
}

const CATEGORIES: { label: string; icons: string[] }[] = [
  {
    label: 'Educación',
    icons: ['📚', '📖', '🏫', '✏️', '🖊️', '📝', '🎓', '📐', '🔬', '🔭', '💻', '📊', '🖥️', '📓'],
  },
  {
    label: 'Salud',
    icons: ['🏥', '💊', '🩺', '🩹', '💉', '🧪', '🧬', '🫀', '🦷', '🩻', '🚑', '🧘', '❤️‍🩹', '🩼'],
  },
  {
    label: 'Desarrollo',
    icons: ['🌱', '🌾', '🌿', '🏡', '🔨', '⚙️', '🚜', '🛠️', '🔧', '🏗️', '⚡', '🔋', '☀️', '🌻'],
  },
  {
    label: 'Personas',
    icons: ['👶', '🧒', '👦', '👧', '🤝', '🙏', '👐', '🫶', '🧑‍⚕️', '🧑‍🏫', '👨‍👩‍👧', '🫂', '💑', '🧕'],
  },
  {
    label: 'Naturaleza',
    icons: ['💧', '🌊', '🌳', '🌲', '⛰️', '🌄', '🏔️', '🌍', '🌏', '🌺', '🐓', '🐾', '☀️', '🌙'],
  },
  {
    label: 'Símbolos',
    icons: ['⭐', '🏆', '🎯', '💡', '🔑', '🕊️', '✨', '🌟', '🎁', '💛', '💚', '🧡', '🤍', '🏅'],
  },
];

export default function IconPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:border-primary-800 hover:shadow-sm transition-all group"
      >
        <span className="text-4xl leading-none w-10 text-center">{value || '?'}</span>
        <div className="text-left">
          <div className="text-xs text-gray-500">Icono actual</div>
          <div className="text-sm font-medium text-primary-800 group-hover:text-primary-900">
            Cambiar icono ↓
          </div>
        </div>
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
          {/* Category tabs */}
          <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100 px-2 pt-2 gap-0.5 bg-gray-50">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.label}
                type="button"
                onClick={() => setActiveCategory(i)}
                className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                  activeCategory === i
                    ? 'bg-white text-primary-800 border border-gray-200 border-b-white -mb-px'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Icons grid */}
          <div className="p-3 grid grid-cols-7 gap-1 max-h-48 overflow-y-auto">
            {CATEGORIES[activeCategory].icons.map(icon => (
              <button
                key={icon}
                type="button"
                onClick={() => { onChange(icon); setOpen(false); }}
                className={`text-2xl p-1.5 rounded-lg hover:bg-primary-50 hover:scale-110 transition-all text-center leading-none ${
                  value === icon ? 'bg-primary-100 ring-2 ring-primary-800 scale-110' : ''
                }`}
                title={icon}
              >
                {icon}
              </button>
            ))}
          </div>

          <div className="px-3 pb-3 pt-1 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              Haz clic en un icono para seleccionarlo
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
