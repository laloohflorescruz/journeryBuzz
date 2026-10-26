import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import Icon from '../components/Icon';
import RichTextEditor from '../components/RichTextEditor';
import { ImageUploader } from '../components/ImageUploader';
import { Input } from '../components/FormFields';
import { apiErrorMessage } from '../lib/apiError';
import { fieldClass, labelClass } from '../lib/forms';
import { useAuth } from '../context/AuthContext';

// Perfil público del socio en el portal (/provider/<slug>): presentación,
// logo, portada, web y redes. Influencers, guías y agencias lo usan como su
// escaparate; los viajeros lo siguen desde ahí. Se guarda en /companies/<id>/.

const PORTAL_URL = (import.meta.env.VITE_PORTAL_URL ?? 'https://www.journery.com').replace(/\/$/, '');

const SOCIALS = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'x', label: 'X' },
] as const;

const TYPES = [
  { value: 'influencer', label: 'Influencer de viajes' },
  { value: 'tour-operator', label: 'Tour operador' },
  { value: 'travel-agency', label: 'Agencia de viajes' },
  { value: 'tour-guide', label: 'Guía turístico' },
  { value: 'local-guide', label: 'Guía local' },
  { value: 'independent', label: 'Operador independiente' },
  { value: 'excursion', label: 'Empresa de excursiones' },
];

interface Company {
  id: number;
  name: string;
  slug: string;
  provider_type: string;
  description: string;
  logo: string;
  cover_image: string;
  website: string;
  social_links: Record<string, string> | null;
  is_verified: boolean;
  is_active: boolean;
}

type Draft = Pick<Company, 'provider_type' | 'description' | 'logo' | 'cover_image' | 'website'> & { social_links: Record<string, string> };

const toDraft = (c: Company): Draft => ({
  provider_type: c.provider_type || '',
  description: c.description || '',
  logo: c.logo || '',
  cover_image: c.cover_image || '',
  website: c.website || '',
  social_links: { ...(c.social_links || {}) },
});

const PublicProfile: React.FC = () => {
  const { isAdminOrAbove } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/companies/')
      .then(({ data }) => {
        const list: Company[] = Array.isArray(data) ? data : data?.results ?? [];
        setCompanies(list);
        if (list[0]) setSelectedId(list[0].id);
      })
      .catch((err) => setError(apiErrorMessage(err, 'No se pudo cargar tu empresa.')))
      .finally(() => setLoading(false));
  }, []);

  const company = useMemo(() => companies.find((c) => c.id === selectedId) ?? null, [companies, selectedId]);
  useEffect(() => { setDraft(company ? toDraft(company) : null); setSaved(false); }, [company]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => { setDraft((d) => (d ? { ...d, [key]: value } : d)); setSaved(false); };
  const setSocial = (key: string, value: string) => set('social_links', { ...(draft?.social_links ?? {}), [key]: value });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !draft) return;
    setSaving(true); setError('');
    try {
      const { data } = await api.patch<Company>(`/companies/${company.id}/`, draft);
      setCompanies((list) => list.map((c) => (c.id === data.id ? data : c)));
      setSaved(true);
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo guardar el perfil.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />;
  if (!company || !draft) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        {error || 'Tu usuario no está vinculado a ninguna empresa todavía.'}
      </div>
    );
  }

  const publicUrl = `${PORTAL_URL}/provider/${company.slug || company.id}`;
  const isPublic = company.is_active && company.is_verified;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Perfil público</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">Lo que ven los viajeros en el portal: tu presentación, tus redes y tus tours publicados. Los viajeros con cuenta pueden seguirte.</p>
        </div>
        <div className="flex items-center gap-3">
          {isAdminOrAbove() && companies.length > 1 && (
            <select aria-label="Empresa" value={selectedId ?? ''} onChange={(e) => setSelectedId(Number(e.target.value))} className={`${fieldClass} w-64`}>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          {isPublic && (
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-900">
              <Icon name="eye" className="h-4 w-4" /> Ver en el portal
            </a>
          )}
        </div>
      </div>

      {!isPublic && (
        <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
          El perfil se publica cuando el equipo de Journery verifique la empresa. Mientras tanto puedes dejarlo listo.
        </p>
      )}

      <form onSubmit={save} className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
          <div>
            <label className={labelClass}>Tipo de socio</label>
            <select value={draft.provider_type} onChange={(e) => set('provider_type', e.target.value)} className={fieldClass}>
              <option value="">Sin indicar</option>
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              {draft.provider_type && !TYPES.some((t) => t.value === draft.provider_type) && <option value={draft.provider_type}>{draft.provider_type}</option>}
            </select>
          </div>
          <RichTextEditor label={draft.provider_type === 'influencer' ? 'Sobre ti' : 'Sobre la empresa'} value={draft.description} onChange={(v) => set('description', v)}
            placeholder="Quién eres, qué tipo de viajes organizas y para quién." />
          <Input label="Sitio web" type="url" value={draft.website} onChange={(e) => set('website', e.target.value)} placeholder="https://…" />

          <div>
            <p className={labelClass}>Redes sociales</p>
            <p className="mb-3 text-xs text-slate-500">Tu usuario (@nombre) o el enlace completo.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {SOCIALS.map((s) => (
                <Input key={s.key} label={s.label} value={draft.social_links[s.key] ?? ''} maxLength={200}
                  onChange={(e) => setSocial(s.key, e.target.value)} placeholder="@usuario" />
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
          <ImageUploader label={draft.provider_type === 'influencer' ? 'Foto de perfil' : 'Logo'} value={draft.logo} folder="companies" onChange={(url) => set('logo', url)} />
          <ImageUploader label="Portada (horizontal)" value={draft.cover_image} folder="companies" onChange={(url) => set('cover_image', url)} />
        </aside>

        <div className="flex items-center justify-end gap-3 lg:col-span-2">
          {error && <span className="text-sm text-rose-600">{error}</span>}
          {saved && <span className="inline-flex items-center gap-1 text-sm text-emerald-700"><Icon name="check" className="h-4 w-4" /> Guardado</span>}
          <button type="submit" disabled={saving} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
            {saving ? 'Guardando…' : 'Guardar perfil'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PublicProfile;
