import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExt from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { useRef, useState } from 'react';

// Image extension with alignment attribute
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

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
}

function ToolbarBtn({
  onClick, active, title, children,
}: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
        active
          ? 'bg-primary-800 text-white shadow-sm ring-1 ring-primary-900'
          : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );
}

const sep = <span className="w-px h-5 bg-gray-200 mx-1 self-center" />;

export default function RichTextEditor({ value, onChange, placeholder, minHeight = 320, maxHeight = 600 }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageAlign, setImageAlign] = useState<'left' | 'center' | 'right' | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Underline,
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
      Placeholder.configure({ placeholder: placeholder || 'Escribe el contenido aquí…' }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onSelectionUpdate: ({ editor }) => {
      const { selection } = editor.state;
      const node = (selection as { node?: { type: { name: string }; attrs: Record<string, string> } }).node;
      if (node?.type?.name === 'image') {
        setImageAlign((node.attrs.align as 'left' | 'center' | 'right') || 'center');
      } else {
        setImageAlign(null);
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
        editor.chain().focus().setImage({ src: data.url, align: 'center' } as never).run();
      }
    } catch {
      alert('Error al subir la imagen');
    }
  };

  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL del enlace', prev || 'https://');
    if (url === null) return;
    if (url === '') { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-800">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
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
        <ToolbarBtn title="Título H2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </ToolbarBtn>
        <ToolbarBtn title="Título H3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </ToolbarBtn>
        <ToolbarBtn title="Título H4" active={editor.isActive('heading', { level: 4 })} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}>
          H4
        </ToolbarBtn>
        {sep}
        <ToolbarBtn title="Lista con viñetas" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          ≡
        </ToolbarBtn>
        <ToolbarBtn title="Lista numerada" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1.
        </ToolbarBtn>
        {sep}
        <ToolbarBtn title="Cita" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          "
        </ToolbarBtn>
        <ToolbarBtn title="Separador horizontal" active={false} onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          —
        </ToolbarBtn>
        {sep}
        <ToolbarBtn title="Enlace" active={editor.isActive('link')} onClick={setLink}>
          🔗
        </ToolbarBtn>
        <ToolbarBtn
          title="Insertar imagen"
          active={false}
          onClick={() => fileInputRef.current?.click()}
        >
          🖼
        </ToolbarBtn>
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
        <ToolbarBtn title="Deshacer" active={false} onClick={() => editor.chain().focus().undo().run()}>
          ↩
        </ToolbarBtn>
        <ToolbarBtn title="Rehacer" active={false} onClick={() => editor.chain().focus().redo().run()}>
          ↪
        </ToolbarBtn>
      </div>

      {/* Image alignment toolbar — visible only when an image is selected */}
      {imageAlign !== null && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border-b border-blue-100 text-xs">
          <span className="text-blue-700 font-medium mr-1">Imagen:</span>
          {(['left', 'center', 'right'] as const).map(a => (
            <button
              key={a}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().updateAttributes('image', { align: a }).run();
                setImageAlign(a);
              }}
              className={`px-2 py-0.5 rounded font-medium transition-colors border ${
                imageAlign === a
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-100'
              }`}
            >
              {a === 'left' ? '◀ Izquierda' : a === 'center' ? '■ Centro' : 'Derecha ▶'}
            </button>
          ))}
        </div>
      )}

      {/* Editor area */}
      <div style={{ maxHeight, overflowY: 'auto' }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
