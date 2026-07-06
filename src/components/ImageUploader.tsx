import React, { useRef, useState, useEffect } from 'react';
import api from '../services/api';

interface UploadResponse {
  id: number;
  url: string;
  public_id: string;
  variants?: Record<string, string>;
  // Créditos (vienen vacíos al subir; se editan luego)
  author?: string;
  source_url?: string;
  license?: string;
  license_url?: string;
  modified?: boolean;
  attribution?: string;
}

async function uploadFile(file: File, folder?: string): Promise<UploadResponse> {
  const form = new FormData();
  form.append('file', file);
  if (folder) form.append('folder', folder);
  // Content-Type undefined → axios pone multipart/form-data con boundary correcto.
  const { data } = await api.post('/media/upload/', form, {
    headers: { 'Content-Type': undefined } as never,
  });
  return data;
}

function errorMessage(err: unknown): string {
  const e = err as { response?: { data?: { error?: string } } };
  return e.response?.data?.error || 'Error al subir la imagen.';
}

// ─── Single image ─────────────────────────────────────────────────────────────

interface ImageUploaderProps {
  label: string;
  value: string;
  folder?: string;
  onChange: (url: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ label, value, folder, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true); setError('');
    try {
      const data = await uploadFile(file, folder);
      onChange(data.url);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (uploading) return;
    handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="flex items-start gap-3">
        <div
          onDragOver={e => { e.preventDefault(); if (!uploading) setDragging(true); }}
          onDragLeave={e => { e.preventDefault(); setDragging(false); }}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`w-24 h-24 shrink-0 rounded-lg border-2 border-dashed bg-gray-50 overflow-hidden flex items-center justify-center cursor-pointer transition-colors ${
            dragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
          }`}
        >
          {value
            ? <img src={value} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.opacity = '0.2')} />
            : <span className="text-gray-300 text-2xl">🖼️</span>}
        </div>
        <div className="flex-1 space-y-2">
          <input
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="https://… o sube un archivo"
            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5"
            >
              {uploading
                ? <><svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Subiendo…</>
                : <>⬆️ Subir imagen</>}
            </button>
            {value && (
              <button type="button" onClick={() => onChange('')} className="text-xs text-gray-400 hover:text-red-500">Quitar</button>
            )}
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
        </div>
      </div>
    </div>
  );
};

// ─── Créditos / licencia Creative Commons (propiedades del MediaAsset) ──────────

// Créditos de una imagen (snake_case = igual que la API MediaAsset).
export interface AssetCredit {
  id?: number;
  author: string;
  source_url: string;
  license: string;
  license_url: string;
  modified: boolean;
  attribution: string;
}

const emptyCredit = (): AssetCredit => ({
  author: '', source_url: '', license: '', license_url: '', modified: false, attribution: '',
});

// Licencias Creative Commons comunes (label → URL canónica).
export const CC_LICENSES: { label: string; url: string }[] = [
  { label: 'CC BY 4.0', url: 'https://creativecommons.org/licenses/by/4.0/' },
  { label: 'CC BY-SA 4.0', url: 'https://creativecommons.org/licenses/by-sa/4.0/' },
  { label: 'CC BY-ND 4.0', url: 'https://creativecommons.org/licenses/by-nd/4.0/' },
  { label: 'CC BY-NC 4.0', url: 'https://creativecommons.org/licenses/by-nc/4.0/' },
  { label: 'CC BY-NC-SA 4.0', url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/' },
  { label: 'CC BY-NC-ND 4.0', url: 'https://creativecommons.org/licenses/by-nc-nd/4.0/' },
  { label: 'CC0 1.0 (Dominio público)', url: 'https://creativecommons.org/publicdomain/zero/1.0/' },
  { label: 'Public Domain Mark', url: 'https://creativecommons.org/publicdomain/mark/1.0/' },
];

// Atribución sugerida (ej. "Photo by Jane Doe, licensed under CC BY-SA 4.0").
export function buildAttribution(c: AssetCredit): string {
  if (!c.author && !c.license) return '';
  const by = c.author ? `Photo by ${c.author}` : 'Photo';
  const lic = c.license ? `, licensed under ${c.license}` : '';
  const mod = c.modified ? ' (modified)' : '';
  return `${by}${lic}${mod}`;
}

// ─── Gallery (multiple) ───────────────────────────────────────────────────────

interface GalleryUploaderProps {
  items: string[];
  folder?: string;
  onChange: (urls: string[]) => void;
}

const ccFieldClass = 'w-full px-2 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none';
const ccLabelClass = 'mb-0.5 block text-[11px] font-medium text-gray-500';

export const GalleryUploader: React.FC<GalleryUploaderProps> = ({ items, folder, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  // Créditos por URL (cargados/guardados contra MediaAsset). Sin `id` = imagen sin registro.
  const [credits, setCredits] = useState<Record<string, AssetCredit>>({});

  // Carga los créditos de las URLs que aún no tenemos (fotos ya subidas al editar).
  useEffect(() => {
    const missing = items.filter(u => u && !(u in credits));
    if (missing.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/media/credits/', { params: { urls: missing.join(',') } });
        if (cancelled) return;
        setCredits(prev => {
          const next = { ...prev };
          for (const u of missing) if (!(u in next)) next[u] = emptyCredit();
          for (const a of data as (AssetCredit & { url: string })[]) {
            next[a.url] = {
              id: a.id, author: a.author || '', source_url: a.source_url || '',
              license: a.license || '', license_url: a.license_url || '',
              modified: !!a.modified, attribution: a.attribution || '',
            };
          }
          return next;
        });
      } catch { /* sin créditos: se editarán cuando exista el asset */ }
    })();
    return () => { cancelled = true; };
  }, [items, credits]);

  const handleFiles = async (files: FileList | File[] | null) => {
    const list = files ? Array.from(files).filter(f => f.type.startsWith('image/')) : [];
    if (list.length === 0) return;
    setUploading(true); setError('');
    try {
      const urls: string[] = [];
      const newCredits: Record<string, AssetCredit> = {};
      for (const file of list) {
        const data = await uploadFile(file, folder);
        urls.push(data.url);
        newCredits[data.url] = {
          id: data.id, author: data.author || '', source_url: data.source_url || '',
          license: data.license || '', license_url: data.license_url || '',
          modified: !!data.modified, attribution: data.attribution || '',
        };
      }
      setCredits(prev => ({ ...prev, ...newCredits }));
      onChange([...items, ...urls]);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (uploading) return;
    handleFiles(e.dataTransfer.files);
  };

  // Aplica cambios a los créditos de una URL y los persiste en su MediaAsset.
  const update = (url: string, patch: Partial<AssetCredit>) => {
    const current = credits[url] || emptyCredit();
    let merged: AssetCredit = { ...current, ...patch };
    const touchesCredit = 'author' in patch || 'license' in patch || 'modified' in patch;
    if (touchesCredit && (!merged.attribution || merged.attribution === buildAttribution(current))) {
      merged = { ...merged, attribution: buildAttribution(merged) };
    }
    setCredits(prev => ({ ...prev, [url]: merged }));
    if (merged.id) {
      const { author, source_url, license, license_url, modified, attribution } = merged;
      api.patch(`/media/${merged.id}/`, { author, source_url, license, license_url, modified, attribution })
        .catch(() => setError('No se pudieron guardar los créditos de una imagen.'));
    }
  };

  const pickLicense = (url: string, label: string) => {
    const preset = CC_LICENSES.find(l => l.label === label);
    update(url, { license: label, ...(preset ? { license_url: preset.url } : {}) });
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); if (!uploading) setDragging(true); }}
      onDragLeave={e => { e.preventDefault(); setDragging(false); }}
      onDrop={handleDrop}
      className={`space-y-3 rounded-lg border-2 border-dashed p-3 transition-colors ${
        dragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
      }`}
    >
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((url, i) => {
            const c = credits[url] || emptyCredit();
            const editable = !!c.id;
            return (
            <div key={i} className="rounded-lg border border-gray-200 bg-white">
              <div className="flex items-center gap-3 p-2">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-gray-50">
                  <img src={url} alt="" className="h-full w-full object-cover" onError={e => (e.currentTarget.style.opacity = '0.2')} />
                  {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-amber-500 text-center text-[9px] font-semibold text-white">Portada</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-gray-600">{url}</p>
                  <p className="truncate text-[11px] text-gray-400">{c.attribution || 'Sin créditos'}</p>
                </div>
                <button type="button" onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  className="rounded-lg border border-gray-300 px-2 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50">
                  {openIdx === i ? 'Cerrar' : 'Créditos'}
                </button>
                <button type="button" onClick={() => { onChange(items.filter((_, j) => j !== i)); if (openIdx === i) setOpenIdx(null); }}
                  className="text-gray-400 hover:text-red-500" title="Quitar foto">×</button>
              </div>

              {openIdx === i && (
                editable ? (
                <div className="grid grid-cols-1 gap-2 border-t border-gray-100 p-3 sm:grid-cols-2">
                  <div>
                    <label className={ccLabelClass}>Autor</label>
                    <input value={c.author} placeholder="Jane Doe" className={ccFieldClass}
                      onChange={e => update(url, { author: e.target.value })} />
                  </div>
                  <div>
                    <label className={ccLabelClass}>URL de origen</label>
                    <input value={c.source_url} placeholder="https://commons.wikimedia.org/…" className={ccFieldClass}
                      onChange={e => update(url, { source_url: e.target.value })} />
                  </div>
                  <div>
                    <label className={ccLabelClass}>Licencia</label>
                    <input value={c.license} placeholder="CC BY-SA 4.0" list="cc-licenses" className={ccFieldClass}
                      onChange={e => pickLicense(url, e.target.value)} />
                  </div>
                  <div>
                    <label className={ccLabelClass}>URL de la licencia</label>
                    <input value={c.license_url} placeholder="https://creativecommons.org/licenses/by-sa/4.0/" className={ccFieldClass}
                      onChange={e => update(url, { license_url: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input id={`mod-${i}`} type="checkbox" checked={c.modified} className="h-4 w-4 accent-emerald-600"
                      onChange={e => update(url, { modified: e.target.checked })} />
                    <label htmlFor={`mod-${i}`} className="text-xs font-medium text-gray-600">Modificada</label>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className={ccLabelClass}>Atribución</label>
                      <button type="button" onClick={() => update(url, { attribution: buildAttribution(c) })}
                        className="text-[11px] font-medium text-emerald-600 hover:underline">Generar</button>
                    </div>
                    <input value={c.attribution} placeholder="Photo by Jane Doe, licensed under CC BY-SA 4.0" className={ccFieldClass}
                      onChange={e => update(url, { attribution: e.target.value })} />
                  </div>
                </div>
                ) : (
                  <p className="border-t border-gray-100 p-3 text-[11px] text-gray-400">
                    Esta imagen no tiene registro de medios, no se pueden editar sus créditos. Vuelve a subirla para asignar autor/licencia.
                  </p>
                )
              )}
            </div>
            );
          })}
        </div>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5"
        >
          {uploading
            ? <><svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Subiendo…</>
            : <>⬆️ Subir fotos</>}
        </button>
        <span className="text-xs text-gray-400">
          {dragging ? 'Suelta las fotos aquí' : `${items.length} foto(s) · o arrastra varias aquí`}
        </span>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <datalist id="cc-licenses">
        {CC_LICENSES.map(l => <option key={l.label} value={l.label} />)}
      </datalist>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
    </div>
  );
};
