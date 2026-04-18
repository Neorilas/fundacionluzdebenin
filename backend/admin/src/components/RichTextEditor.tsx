import { useEditor, EditorContent } from '@tiptap/react';
import { Node } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import ImageExt from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { useRef, useState } from 'react';
import MediaPicker from './MediaPicker';

// ── Helpers ──────────────────────────────────────────────────────────────────
function b64enc(s: string): string {
  return btoa(encodeURIComponent(s));
}
function b64dec(s: string): string {
  try { return decodeURIComponent(atob(s)); } catch { return s; }
}

/** Decode html-block divs back to raw HTML before saving to the database */
function decodeHtmlBlocks(html: string): string {
  return html.replace(
    /<div[^>]+data-html-block="([^"]*)"[^>]*>\s*<\/div>/g,
    (_, encoded) => b64dec(encoded),
  );
}

// ── Custom Image extension (alignment + alt) ─────────────────────────────────
const Image = ImageExt.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: 'center',
        renderHTML: ({ align }) => {
          if (align === 'left')
            return { style: 'float:left;margin:0 1.5rem 1rem 0;max-width:50%;' };
          if (align === 'right')
            return { style: 'float:right;margin:0 0 1rem 1.5rem;max-width:50%;' };
          return { style: 'display:block;margin-left:auto;margin-right:auto;' };
        },
        parseHTML: (el) => {
          const s = el.getAttribute('style') || '';
          if (s.includes('float:left') || s.includes('float: left')) return 'left';
          if (s.includes('float:right') || s.includes('float: right')) return 'right';
          return 'center';
        },
      },
    };
  },
});

// ── HtmlBlock: raw HTML node (iframes, widgets, embeds…) ─────────────────────
const HtmlBlock = Node.create({
  name: 'htmlBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      html: {
        default: '',
        parseHTML: (el) => {
          const encoded = el.getAttribute('data-html-block');
          if (encoded !== null) return b64dec(encoded);
          // Fallback: capture raw element as HTML (e.g. existing iframes in DB)
          return el.outerHTML;
        },
        renderHTML: ({ html }) => ({
          'data-html-block': b64enc(html as string),
        }),
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'div[data-html-block]' },
      { tag: 'iframe' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', HTMLAttributes];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div');
      dom.setAttribute('contenteditable', 'false');
      dom.className =
        'not-prose my-3 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 overflow-hidden cursor-default select-none';

      const bar = document.createElement('div');
      bar.className =
        'flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-xs text-blue-700 font-mono font-medium border-b border-blue-200';
      bar.textContent = '</> Bloque HTML';

      const preview = document.createElement('div');
      preview.className = 'p-3 pointer-events-none opacity-80 text-center overflow-hidden max-h-32';
      preview.innerHTML = node.attrs.html;

      dom.appendChild(bar);
      dom.appendChild(preview);
      return { dom };
    };
  },
});

// ── Toolbar button ────────────────────────────────────────────────────────────
function ToolbarBtn({
  onClick, active, title, children, danger,
}: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode; danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
        danger
          ? 'text-orange-600 hover:bg-orange-100'
          : active
            ? 'bg-primary-800 text-white shadow-sm ring-1 ring-primary-900'
            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );
}

const sep = <span className="w-px h-5 bg-gray-200 mx-1 self-center" />;

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function RichTextEditor({
  value, onChange, placeholder, minHeight = 320, maxHeight = 600,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image context toolbar
  const [imageAlign, setImageAlign] = useState<'left' | 'center' | 'right' | null>(null);
  const [imageAlt, setImageAlt] = useState('');

  // Media picker (gallery)
  const [showMedia, setShowMedia] = useState(false);

  // HTML block insertion modal
  const [showHtmlModal, setShowHtmlModal] = useState(false);
  const [htmlInput, setHtmlInput] = useState('');

  // Source view (full HTML editor)
  const [showSource, setShowSource] = useState(false);
  const [sourceHtml, setSourceHtml] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Underline,
      Image.configure({ inline: false }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: placeholder || 'Escribe el contenido aquí…' }),
      HtmlBlock,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const raw = editor.getHTML();
      onChange(decodeHtmlBlocks(raw));
    },
    onSelectionUpdate: ({ editor }) => {
      const { selection } = editor.state;
      const node = (selection as { node?: { type: { name: string }; attrs: Record<string, string> } }).node;
      if (node?.type?.name === 'image') {
        setImageAlign((node.attrs.align as 'left' | 'center' | 'right') || 'center');
        setImageAlt(node.attrs.alt || '');
      } else {
        setImageAlign(null);
        setImageAlt('');
      }
    },
    editorProps: {
      attributes: {
        class: 'outline-none prose max-w-none px-4 py-3',
        style: `min-height:${minHeight}px`,
      },
    },
  });

  if (!editor) return null;

  // ── Actions ─────────────────────────────────────────────────────────────────
  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const token = localStorage.getItem('admin_token');
    try {
      const r = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await r.json();
      if (data.url) {
        const alt = window.prompt(
          'Texto alternativo (alt) — describe la imagen para SEO y accesibilidad:',
          '',
        ) ?? '';
        editor.chain().focus().setImage({ src: data.url, alt, align: 'center' } as never).run();
      }
    } catch {
      alert('Error al subir la imagen');
    }
  };

  const insertFromGallery = (url: string, alt?: string) => {
    editor.chain().focus().setImage({ src: url, alt: alt || '', align: 'center' } as never).run();
  };

  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL del enlace', prev || 'https://');
    if (url === null) return;
    if (url === '') { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url }).run();
  };

  const insertHtmlBlock = () => {
    const trimmed = htmlInput.trim();
    if (!trimmed) return;
    editor.chain().focus().insertContent({ type: 'htmlBlock', attrs: { html: trimmed } }).run();
    setHtmlInput('');
    setShowHtmlModal(false);
  };

  const openSourceView = () => {
    const raw = editor.getHTML();
    setSourceHtml(decodeHtmlBlocks(raw));
    setShowSource(true);
  };

  const applySourceView = () => {
    // setContent triggers onUpdate which calls onChange automatically
    editor.commands.setContent(sourceHtml);
    setShowSource(false);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-800">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">

        {/* Formatting */}
        <ToolbarBtn title="Negrita" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <strong>B</strong>
        </ToolbarBtn>
        <ToolbarBtn title="Cursiva" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <em>I</em>
        </ToolbarBtn>
        <ToolbarBtn title="Subrayado" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <span style={{ textDecoration: 'underline' }}>U</span>
        </ToolbarBtn>
        {sep}

        {/* Headings */}
        <ToolbarBtn title="Título H2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarBtn>
        <ToolbarBtn title="Título H3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolbarBtn>
        <ToolbarBtn title="Título H4" active={editor.isActive('heading', { level: 4 })} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}>H4</ToolbarBtn>
        {sep}

        {/* Text alignment */}
        <ToolbarBtn title="Alinear a la izquierda" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 5h18v2H3V5zm0 4h12v2H3V9zm0 4h18v2H3v-2zm0 4h12v2H3v-2z"/></svg>
        </ToolbarBtn>
        <ToolbarBtn title="Centrar texto" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 5h18v2H3V5zm3 4h12v2H6V9zm-3 4h18v2H3v-2zm3 4h12v2H6v-2z"/></svg>
        </ToolbarBtn>
        <ToolbarBtn title="Alinear a la derecha" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 5h18v2H3V5zm6 4h12v2H9V9zm-6 4h18v2H3v-2zm6 4h12v2H9v-2z"/></svg>
        </ToolbarBtn>
        {sep}

        {/* Lists */}
        <ToolbarBtn title="Lista con viñetas" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>≡</ToolbarBtn>
        <ToolbarBtn title="Lista numerada" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1.</ToolbarBtn>
        {sep}

        {/* Blocks */}
        <ToolbarBtn title="Cita" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>"</ToolbarBtn>
        <ToolbarBtn title="Separador horizontal" active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()}>—</ToolbarBtn>
        {sep}

        {/* Links & Images */}
        <ToolbarBtn title="Insertar / editar enlace" active={editor.isActive('link')} onClick={setLink}>🔗</ToolbarBtn>
        <ToolbarBtn title="Subir imagen nueva" active={false} onClick={() => fileInputRef.current?.click()}>📤</ToolbarBtn>
        <ToolbarBtn title="Elegir imagen de la biblioteca" active={false} onClick={() => setShowMedia(true)}>🖼</ToolbarBtn>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadImage(f);
            e.target.value = '';
          }}
        />
        {sep}

        {/* HTML block */}
        <ToolbarBtn title="Insertar bloque HTML (iframe, widget…)" active={false} onClick={() => setShowHtmlModal(true)}>
          <span className="font-mono text-xs">&lt;/&gt;</span>
        </ToolbarBtn>

        {/* Source view */}
        <ToolbarBtn title="Ver / editar HTML fuente" active={showSource} danger onClick={openSourceView}>
          <span className="font-mono text-xs">{ }</span>
        </ToolbarBtn>
        {sep}

        {/* Undo/Redo */}
        <ToolbarBtn title="Deshacer" active={false} onClick={() => editor.chain().focus().undo().run()}>↩</ToolbarBtn>
        <ToolbarBtn title="Rehacer" active={false} onClick={() => editor.chain().focus().redo().run()}>↪</ToolbarBtn>
      </div>

      {/* ── Image context toolbar ── */}
      {imageAlign !== null && (
        <div className="flex flex-col gap-2 px-3 py-2 bg-blue-50 border-b border-blue-100">
          {/* Alignment row */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-blue-700 font-medium mr-1 shrink-0">Alineación:</span>
            {(['left', 'center', 'right'] as const).map(a => (
              <button
                key={a}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  editor.chain().focus().updateAttributes('image', { align: a }).run();
                  setImageAlign(a);
                }}
                className={`px-2 py-0.5 rounded font-medium transition-colors border text-xs ${
                  imageAlign === a
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-100'
                }`}
              >
                {a === 'left' ? '◀ Izq.' : a === 'center' ? '■ Centro' : 'Der. ▶'}
              </button>
            ))}
          </div>
          {/* Alt text row */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-blue-700 font-medium shrink-0">Alt:</label>
            <input
              type="text"
              value={imageAlt}
              onChange={(e) => {
                setImageAlt(e.target.value);
                editor.chain().focus().updateAttributes('image', { alt: e.target.value }).run();
              }}
              placeholder="Descripción de la imagen para SEO y accesibilidad"
              className="flex-1 border border-blue-200 rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
        </div>
      )}

      {/* ── Editor area ── */}
      <div style={{ maxHeight, overflowY: 'auto' }}>
        <EditorContent editor={editor} />
      </div>

      {/* ── Media picker modal ── */}
      {showMedia && (
        <MediaPicker
          askAlt
          onSelect={insertFromGallery}
          onClose={() => setShowMedia(false)}
        />
      )}

      {/* ── HTML block modal ── */}
      {showHtmlModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={(e) => { if (e.target === e.currentTarget) setShowHtmlModal(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-base font-bold text-gray-900">Insertar bloque HTML</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Pega iframes, widgets de donación (Teaming, etc.), botones embebidos…
                </p>
              </div>
              <button onClick={() => setShowHtmlModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-6">
              <textarea
                className="w-full h-48 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-800 resize-none"
                placeholder={'<iframe src="..." width="300" height="200"></iframe>'}
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-2">
                El bloque HTML se muestra como vista previa en el editor pero se renderiza completo en la web pública.
              </p>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setShowHtmlModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
              <button
                onClick={insertHtmlBlock}
                disabled={!htmlInput.trim()}
                className="px-5 py-2 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-900 disabled:opacity-40 transition-colors"
              >
                Insertar bloque
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Source view modal ── */}
      {showSource && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={(e) => { if (e.target === e.currentTarget) setShowSource(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-base font-bold text-gray-900">HTML fuente</h2>
                <p className="text-xs text-orange-600 font-medium mt-0.5">
                  ⚠️ Edición avanzada — modifica con cuidado
                </p>
              </div>
              <button onClick={() => setShowSource(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-hidden p-4">
              <textarea
                className="w-full h-full min-h-[400px] border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                value={sourceHtml}
                onChange={(e) => setSourceHtml(e.target.value)}
                spellCheck={false}
              />
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setShowSource(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancelar</button>
              <button
                onClick={applySourceView}
                className="px-5 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
              >
                Aplicar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
