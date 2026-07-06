import React, { useEffect, useRef } from 'react';

// Editor de texto enriquecido sin dependencias (contentEditable). Guarda HTML.
// Portado del admin para el mismo concepto/modularidad.

const BTN = 'rounded px-2 py-1 text-sm leading-none text-slate-600 transition-colors hover:bg-slate-100';

const RichTextEditor: React.FC<{
  label?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}> = ({ label, value, onChange, placeholder, minHeight = 160 }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || '')) ref.current.innerHTML = value || '';
  }, [value]);

  const emit = () => onChange(ref.current?.innerHTML ?? '');
  const exec = (cmd: string, arg?: string) => { ref.current?.focus(); document.execCommand(cmd, false, arg); emit(); };
  const addLink = () => { const url = window.prompt('URL del enlace:'); if (url) exec('createLink', url); };

  return (
    <div>
      {label && <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>}
      <div className="rounded-lg border border-slate-300 transition-colors focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
        <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 px-2 py-1">
          <button type="button" onClick={() => exec('bold')} className={BTN} title="Negrita"><b>B</b></button>
          <button type="button" onClick={() => exec('italic')} className={`${BTN} italic`} title="Cursiva">I</button>
          <button type="button" onClick={() => exec('underline')} className={`${BTN} underline`} title="Subrayado">U</button>
          <span className="mx-1 h-4 w-px bg-slate-200" />
          <button type="button" onClick={() => exec('formatBlock', 'H2')} className={BTN} title="Título">H2</button>
          <button type="button" onClick={() => exec('formatBlock', 'H3')} className={BTN} title="Subtítulo">H3</button>
          <button type="button" onClick={() => exec('formatBlock', 'P')} className={BTN} title="Párrafo">¶</button>
          <span className="mx-1 h-4 w-px bg-slate-200" />
          <button type="button" onClick={() => exec('insertUnorderedList')} className={BTN} title="Lista con viñetas">• Lista</button>
          <button type="button" onClick={() => exec('insertOrderedList')} className={BTN} title="Lista numerada">1. Lista</button>
          <button type="button" onClick={addLink} className={BTN} title="Insertar enlace">🔗</button>
          <span className="mx-1 h-4 w-px bg-slate-200" />
          <button type="button" onClick={() => exec('removeFormat')} className={BTN} title="Quitar formato">⌫</button>
        </div>
        <div
          ref={ref}
          contentEditable
          onInput={emit}
          suppressContentEditableWarning
          data-placeholder={placeholder ?? 'Escribe aquí… (usa la barra para dar formato)'}
          className="rt-content px-3 py-2 text-sm text-slate-900 focus:outline-none"
          style={{ minHeight }}
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
