import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Icon, { resolveIcon } from '../components/Icon';
import IconSelect from '../components/IconSelect';
import { ImageUploader, GalleryUploader } from '../components/ImageUploader';
import RichTextEditor from '../components/RichTextEditor';

const LANGUAGE_OPTIONS = [
  { value: 'es', label: 'Español' }, { value: 'en', label: 'Inglés' },
  { value: 'pt', label: 'Portugués' }, { value: 'fr', label: 'Francés' },
  { value: 'de', label: 'Alemán' }, { value: 'it', label: 'Italiano' },
  { value: 'nl', label: 'Neerlandés' }, { value: 'ca', label: 'Catalán' },
];

interface Place { id: number; name: string }
interface TourRow {
  id: number; name: string; city: string; country: string;
  price: string; difficulty: string; image: string;
  is_active: boolean; created_at: string | null;
  creator_contact: { id: number } | null;
}

const DIFFICULTY_LABEL: Record<string, string> = { easy: 'Fácil', moderate: 'Moderada', hard: 'Difícil', extreme: 'Alta' };
const fmtDateTime = (iso: string | null) => iso ? new Date(iso).toLocaleDateString('es', { dateStyle: 'medium' }) : '—';

interface ApiTour {
  id: number; name: string; description: string; about: string;
  city: string; country: string; duration: string; price: string;
  prices?: { adult?: string; child?: string; senior?: string };
  difficulty: string; max_group: number; best_for: string; best_season: string;
  languages: string[]; image: string; gallery: string[];
  latitude: number; longitude: number; is_active: boolean;
  itinerary: ItineraryStep[]; highlights: string[]; includes: string[];
  what_to_bring: string[]; recommendations: string[]; not_suitable_for: string[];
  conditions: string[]; penalties: Penalty[]; available_dates: AvailableDate[];
  payment_options: number[];
  categories: { id: number }[]; activities: { id: number }[];
}

interface Category { id: number; name_en: string; name_es: string; icon: string }
interface Activity { id: number; name_en: string; name_es: string; icon: string }
interface Penalty { window: string; penalty: string; refund: string; tone: 'ok' | 'warn' | 'bad' }
interface AvailableDate { date: string; spots: number }
interface ItineraryStep { time: string; activity: string; description: string }

type FormTab = 'resumen' | 'detalles' | 'multimedia' | 'itinerario' | 'incluye' | 'politicas';
const TABS: { key: FormTab; label: string }[] = [
  { key: 'resumen', label: '📋 Resumen' },
  { key: 'detalles', label: '⏱️ Detalles' },
  { key: 'multimedia', label: '🖼️ Multimedia' },
  { key: 'itinerario', label: '🗺️ Itinerario' },
  { key: 'incluye', label: '✅ Incluye' },
  { key: 'politicas', label: '📄 Políticas' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Fácil', icon: 'hiking' },
  { value: 'moderate', label: 'Moderada', icon: 'compass' },
  { value: 'hard', label: 'Difícil', icon: 'mountain' },
  { value: 'extreme', label: 'Alta', icon: 'climb' },
];
// Deben coincidir con los filtros "Ideal para" y "Época" de la app (backpacking-app CityTours).
const BEST_FOR_OPTIONS = [
  'Familias con niños', 'Parejas', 'Grupos de amigos', 'Viajeros solitarios',
  'Estudiantes', 'Aventureros', 'Amantes de la comida', 'Aficionados a la cultura',
];
const SEASON_OPTIONS = [
  'Todo el año', 'Primavera (Mar-May)', 'Verano (Jun-Ago)', 'Otoño (Sep-Nov)', 'Invierno (Dic-Feb)',
];
const COMMON_LANGS = LANGUAGE_OPTIONS.filter((o) => ['es', 'en', 'pt', 'fr', 'de', 'it', 'ca', 'nl'].includes(o.value));

// Plantillas por defecto de la sección "Incluye" (el creador las puede editar/eliminar).
const DEFAULT_INCLUDES = [
  'Guía profesional',
  'Entradas a los sitios indicados',
  'Transporte local',
  'Agua embotellada',
];
const DEFAULT_WHAT_TO_BRING = [
  'Documento de identidad o pasaporte',
  'Agua y protector solar',
  'Ropa y calzado cómodos',
  'Cámara de fotos',
  'Efectivo para gastos personales',
];
const DEFAULT_RECOMMENDATIONS = [
  'Llega puntual al punto de encuentro para no retrasar al grupo.',
  'Usa calzado cómodo; el recorrido incluye tramos a pie.',
  'Mantente hidratado y protégete del sol, sobre todo en verano.',
  'Respeta las indicaciones del guía y las normas de cada lugar.',
];
const DEFAULT_NOT_SUITABLE = [
  'Personas con movilidad reducida (el recorrido incluye tramos a pie y escaleras).',
  'Mujeres embarazadas.',
  'Menores de 6 años.',
  'Personas con afecciones cardíacas o respiratorias graves.',
];
const DEFAULT_CONDITIONS = [
  'Confirmación inmediata al reservar; recibirás un voucher por correo electrónico.',
  'Preséntate en el punto de encuentro 15 minutos antes de la hora de inicio.',
];
const DEFAULT_PENALTIES: Penalty[] = [
  { window: 'Más de 7 días antes', penalty: 'Sin penalidad', refund: 'Reembolso del 100%', tone: 'ok' },
  { window: 'Entre 3 y 7 días antes', penalty: 'Penalidad del 50%', refund: 'Reembolso parcial', tone: 'warn' },
  { window: 'Menos de 48 h o no presentarse', penalty: 'Penalidad del 100%', refund: 'Sin reembolso', tone: 'bad' },
];

const EMPTY_FORM = {
  name: '', description: '', about: '', city: '', country: '',
  duration: '', price: '', priceChild: '', priceSenior: '', difficulty: 'easy', maxGroup: 10,
  image: '', latitude: '', longitude: '', category: '',
  isActive: true,
  bestFor: [] as string[],
  bestSeason: [] as string[],
  languages: [] as string[],
  activities: [] as number[],
  gallery: [] as string[],
  highlights: [''],
  includes: [...DEFAULT_INCLUDES],
  whatToBring: [...DEFAULT_WHAT_TO_BRING],
  recommendations: [...DEFAULT_RECOMMENDATIONS],
  notSuitableFor: [...DEFAULT_NOT_SUITABLE],
  conditions: [...DEFAULT_CONDITIONS],
  itinerary: [{ time: '', activity: '', description: '' }] as ItineraryStep[],
  penalties: DEFAULT_PENALTIES.map((p) => ({ ...p })),
  availableDates: [{ date: '', spots: 10 }] as AvailableDate[],
  paymentOptions: [25, 50, 100] as number[],
};

// Mapea un tour de la API al estado del formulario (para editar).
const toList = (a?: string[]) => (a && a.length ? a : ['']);
const splitCsv = (s?: string) => (s ? s.split(',').map((x) => x.trim()).filter(Boolean) : []);
function tourToForm(t: ApiTour): typeof EMPTY_FORM {
  return {
    name: t.name || '', description: t.description || '', about: t.about || '',
    city: t.city || '', country: t.country || '',
    duration: t.duration || '', price: t.prices?.adult || t.price || '',
    priceChild: t.prices?.child || '', priceSenior: t.prices?.senior || '',
    difficulty: t.difficulty || 'easy', maxGroup: t.max_group || 10,
    image: t.image || '', latitude: t.latitude != null ? String(t.latitude) : '', longitude: t.longitude != null ? String(t.longitude) : '',
    category: t.categories?.[0]?.id ? String(t.categories[0].id) : '',
    isActive: t.is_active ?? true,
    bestFor: splitCsv(t.best_for), bestSeason: splitCsv(t.best_season),
    languages: t.languages || [],
    activities: (t.activities || []).map((a) => a.id),
    gallery: t.gallery || [],
    highlights: toList(t.highlights), includes: toList(t.includes),
    whatToBring: toList(t.what_to_bring), recommendations: toList(t.recommendations),
    notSuitableFor: toList(t.not_suitable_for), conditions: toList(t.conditions),
    itinerary: t.itinerary?.length ? t.itinerary : [{ time: '', activity: '', description: '' }],
    penalties: t.penalties?.length ? t.penalties : DEFAULT_PENALTIES.map((p) => ({ ...p })),
    availableDates: t.available_dates?.length ? t.available_dates : [{ date: '', spots: 10 }],
    paymentOptions: t.payment_options?.length ? t.payment_options : [25, 50, 100],
  };
}

const fieldClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';
const labelClass = 'mb-1 block text-xs font-medium text-slate-600';

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, className, ...p }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <input {...p} className={`${fieldClass} ${className ?? ''}`} />
  </div>
);
const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, className, ...p }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <textarea {...p} className={`${fieldClass} resize-none ${className ?? ''}`} />
  </div>
);

// Editor de lista de textos con encabezado propio.
function StringList({ label, items, onChange, placeholder }: { label: string; items: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2">
            <input value={it} onChange={(e) => onChange(items.map((x, idx) => (idx === i ? e.target.value : x)))} className={fieldClass} placeholder={`${placeholder} ${i + 1}`} />
            <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="rounded-lg px-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500">
              <Icon name="close" className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => onChange([...items, ''])} className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700">
          <Icon name="plus" className="h-4 w-4" /> Agregar
        </button>
      </div>
    </div>
  );
}

const CityToursApi = () => {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [categories, setCategories] = useState<Category[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [countriesDb, setCountriesDb] = useState<Place[]>([]);
  const [citiesDb, setCitiesDb] = useState<Place[]>([]);
  const [formTab, setFormTab] = useState<FormTab>('resumen');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Listado (solo los tours de ciudad del proveedor: tenant `mine=true`).
  const { user, can } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin' || user?.profile?.role === 'superadmin';
  // Permisos RBAC: sin ellos la API rechaza la escritura, así que no se ofrece.
  const canCreate = can('tour:create');
  const canDelete = can('tour:delete');
  const canEdit = (t: TourRow) =>
    can('tour:update') && (isAdmin || t.creator_contact?.id === user?.id);

  const [view, setView] = useState<'list' | 'create'>('list');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tours, setTours] = useState<TourRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Nueva creación: limpia el formulario y entra al modo crear.
  const startCreate = () => {
    setError(''); setSuccess('');
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setCitiesDb([]);
    setFormTab('resumen');
    setView('create');
  };

  // Cargar un tour existente en el formulario para editar (solo el creador).
  const startEdit = async (id: number) => {
    setError(''); setSuccess('');
    try {
      const { data } = await api.get<ApiTour>(`/tours/${id}/`);
      setForm(tourToForm(data));
      const country = countriesDb.find((c) => c.name === data.country);
      if (country) {
        try { const { data: cs } = await api.get(`/cities/?country_id=${country.id}`); setCitiesDb(cs); } catch { setCitiesDb([]); }
      } else { setCitiesDb([]); }
      setEditingId(id);
      setFormTab('resumen');
      setView('create');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError('No se pudo cargar el tour para editar.');
    }
  };

  const loadTours = () => {
    setLoadingList(true);
    api.get('/tours/?tour_type=city&mine=true')
      .then(({ data }) => setTours(data))
      .catch(() => setTours([]))
      .finally(() => setLoadingList(false));
  };

  useEffect(() => {
    loadTours();
    api.get('/categories/?scope=general').then(({ data }) => setCategories(data)).catch(() => setCategories([]));
    api.get('/activities/').then(({ data }) => setActivities(data)).catch(() => setActivities([]));
    api.get('/countries/').then(({ data }) => setCountriesDb(data)).catch(() => setCountriesDb([]));
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/tours/${id}/`);
      setDeleteId(null);
      loadTours();
    } catch {
      setDeleteId(null);
    }
  };

  // País → Ciudad en cascada: al elegir país, carga sus ciudades y resetea la ciudad.
  const onCountryChange = (name: string) => {
    setForm((f) => ({ ...f, country: name, city: '' }));
    setCitiesDb([]);
    const country = countriesDb.find((c) => c.name === name);
    if (country) api.get(`/cities/?country_id=${country.id}`).then(({ data }) => setCitiesDb(data)).catch(() => setCitiesDb([]));
  };

  const set = <K extends keyof typeof EMPTY_FORM>(k: K, v: (typeof EMPTY_FORM)[K]) => setForm((f) => ({ ...f, [k]: v }));
  const toggleLang = (code: string) =>
    setForm((f) => ({ ...f, languages: f.languages.includes(code) ? f.languages.filter((c) => c !== code) : [...f.languages, code] }));
  const toggleActivity = (id: number) =>
    setForm((f) => ({ ...f, activities: f.activities.includes(id) ? f.activities.filter((a) => a !== id) : [...f.activities, id] }));
  const toggleIn = (key: 'bestFor' | 'bestSeason', v: string) =>
    setForm((f) => ({ ...f, [key]: f[key].includes(v) ? f[key].filter((x) => x !== v) : [...f[key], v] }));

  const tabCls = (t: FormTab) =>
    `whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      formTab === t ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
    }`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.name.trim()) { setFormTab('resumen'); setError('El nombre del tour es obligatorio.'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        about: form.about,
        city: form.city,
        country: form.country,
        duration: form.duration,
        price: form.price,
        prices: { adult: form.price, child: form.priceChild, senior: form.priceSenior },
        difficulty: form.difficulty,
        max_group: Number(form.maxGroup) || 1,
        best_for: form.bestFor.join(', '),
        best_season: form.bestSeason.join(', '),
        languages: form.languages,
        image: form.image,
        gallery: form.gallery.filter(Boolean),
        latitude: Number(form.latitude) || 0,
        longitude: Number(form.longitude) || 0,
        tour_type: 'city',
        is_active: form.isActive,
        itinerary: form.itinerary.filter((s) => s.time || s.activity),
        highlights: form.highlights.filter(Boolean),
        includes: form.includes.filter(Boolean),
        what_to_bring: form.whatToBring.filter(Boolean),
        recommendations: form.recommendations.filter(Boolean),
        not_suitable_for: form.notSuitableFor.filter(Boolean),
        conditions: form.conditions.filter(Boolean),
        penalties: form.penalties.filter((p) => p.window),
        available_dates: form.availableDates.filter((d) => d.date),
        payment_options: form.paymentOptions,
        category_ids: form.category ? [Number(form.category)] : [],
        activity_ids: form.activities,
      };
      if (editingId) {
        await api.put(`/tours/${editingId}/`, payload);
        setSuccess('Tour de ciudad actualizado correctamente.');
      } else {
        await api.post('/tours/', payload);
        setSuccess('Tour de ciudad creado correctamente. Eres el propietario y el único que podrá editarlo.');
      }
      setForm({ ...EMPTY_FORM });
      setCitiesDb([]);
      setFormTab('resumen');
      setEditingId(null);
      setView('list');
      loadTours();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const detail = (err as { response?: { data?: unknown } })?.response?.data;
      setError(typeof detail === 'string' ? detail : 'No se pudo guardar el tour. Revisa los campos e inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (view === 'list') {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
            <Icon name="city" className="h-6 w-6 text-emerald-600" /> Tours de ciudad
          </h1>
          {canCreate && (
          <button type="button" onClick={startCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800">
            <Icon name="plus" className="h-4 w-4" /> Crear tour
          </button>
          )}
        </div>

        {success && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>}

        {loadingList ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">Cargando…</div>
        ) : tours.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Icon name="city" className="h-6 w-6" /></div>
            <h3 className="text-base font-semibold text-slate-900">Aún no has creado tours de ciudad</h3>
            <p className="mt-1 text-sm text-slate-500">Crea tu primer tour para empezar a recibir reservas.</p>
            {canCreate && <button type="button" onClick={startCreate} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"><Icon name="plus" className="h-4 w-4" /> Crear tour</button>}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Tour</th>
                  <th className="px-4 py-3">Ubicación</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Dificultad</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Creado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tours.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 flex-shrink-0 overflow-hidden rounded-md bg-slate-100">
                          {t.image && <img src={t.image} alt="" className="h-full w-full object-cover" />}
                        </div>
                        <span className="font-medium text-slate-800">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{[t.city, t.country].filter(Boolean).join(', ') || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{t.price || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{DIFFICULTY_LABEL[t.difficulty] || t.difficulty || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${t.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{t.is_active ? 'Activo' : 'Inactivo'}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{fmtDateTime(t.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      {deleteId === t.id ? (
                        <span className="inline-flex items-center gap-2 whitespace-nowrap">
                          <button type="button" onClick={() => handleDelete(t.id)} className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-600">Eliminar</button>
                          <button type="button" onClick={() => setDeleteId(null)} className="text-xs text-slate-500 hover:text-slate-800">Cancelar</button>
                        </span>
                      ) : canEdit(t) ? (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap">
                          <button type="button" onClick={() => startEdit(t.id)} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600" title="Editar"><Icon name="pencil" className="h-4 w-4" /></button>
                          {canDelete && <button type="button" onClick={() => setDeleteId(t.id)} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500" title="Eliminar"><Icon name="close" className="h-4 w-4" /></button>}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400" title="Solo el creador puede editar">Solo lectura</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center gap-3">
        <button type="button" onClick={() => { setView('list'); setError(''); setEditingId(null); }}
          className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-900 hover:bg-slate-50">← Volver</button>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
          <Icon name="city" className="h-6 w-6 text-emerald-600" /> {editingId ? 'Editar tour de ciudad' : 'Crear tour de ciudad'}
        </h1>
        {!editingId && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">Serás el propietario</span>}
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Tab bar (píldoras) */}
        <div className="sticky top-16 z-20 -mx-1 mb-4 flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white/90 p-1.5 backdrop-blur">
          {TABS.map(({ key, label }) => (
            <button key={key} type="button" onClick={() => setFormTab(key)} className={tabCls(key)}>{label}</button>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {/* ── RESUMEN ── */}
          {formTab === 'resumen' && (
            <div className="space-y-5">
              <Input label="Nombre del tour *" value={form.name} required onChange={(e) => set('name', e.target.value)} placeholder="Ej. Tour por el centro histórico" />
              <Textarea label="Descripción corta" value={form.description} rows={2} onChange={(e) => set('description', e.target.value)} placeholder="Resumen breve para las tarjetas" />
              <RichTextEditor label="Sobre el tour" value={form.about} onChange={(html) => set('about', html)} placeholder="Texto descriptivo ampliado: qué lo hace especial, para quién es ideal…" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>País</label>
                  <select value={form.country} onChange={(e) => onCountryChange(e.target.value)} className={fieldClass}>
                    <option value="">— Selecciona país —</option>
                    {countriesDb.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Ciudad</label>
                  <select value={form.city} disabled={!form.country} onChange={(e) => set('city', e.target.value)}
                    className={`${fieldClass} disabled:bg-slate-50 disabled:text-slate-400`}>
                    <option value="">{form.country ? '— Selecciona ciudad —' : 'Selecciona un país primero'}</option>
                    {citiesDb.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Categoría</label>
                  <IconSelect value={form.category} onChange={(v) => set('category', v)} placeholder="Sin categoría"
                    options={[{ value: '', label: 'Sin categoría' }, ...categories.map((c) => ({ value: String(c.id), label: c.name_es || c.name_en, icon: c.icon }))]} />
                </div>
                <div>
                  <label className={labelClass}>Dificultad</label>
                  <IconSelect value={form.difficulty} onChange={(v) => set('difficulty', v)} options={DIFFICULTY_OPTIONS} />
                </div>
                <div>
                  <label className={labelClass}>Estado</label>
                  <button type="button" onClick={() => set('isActive', !form.isActive)}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${form.isActive ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-300 text-slate-500'}`}>
                    {form.isActive ? 'Activo (visible)' : 'Inactivo (borrador)'}
                    <span className={`h-4 w-4 rounded-full ${form.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── DETALLES ── */}
          {formTab === 'detalles' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Input label="Duración" value={form.duration} onChange={(e) => set('duration', e.target.value)} placeholder="Ej. 4 horas" />
                <Input label="Tamaño máx. de grupo" type="number" min={1} value={form.maxGroup} onChange={(e) => set('maxGroup', Number(e.target.value))} />
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Latitud" type="number" step="any" value={form.latitude} onChange={(e) => set('latitude', e.target.value)} />
                  <Input label="Longitud" type="number" step="any" value={form.longitude} onChange={(e) => set('longitude', e.target.value)} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Ideal para <span className="font-normal text-slate-400">(varios)</span></label>
                <div className="flex flex-wrap gap-2">
                  {BEST_FOR_OPTIONS.map((o) => {
                    const active = form.bestFor.includes(o);
                    return (
                      <button type="button" key={o} onClick={() => toggleIn('bestFor', o)}
                        className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${active ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-300 text-slate-600 hover:border-slate-400'}`}>
                        {o}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className={labelClass}>Mejor época <span className="font-normal text-slate-400">(varias)</span></label>
                <div className="flex flex-wrap gap-2">
                  {SEASON_OPTIONS.map((o) => {
                    const active = form.bestSeason.includes(o);
                    return (
                      <button type="button" key={o} onClick={() => toggleIn('bestSeason', o)}
                        className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${active ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-300 text-slate-600 hover:border-slate-400'}`}>
                        {o}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className={labelClass}>Precios por persona</label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Input label="Adultos" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="Ej. $45" />
                  <Input label="Niños" value={form.priceChild} onChange={(e) => set('priceChild', e.target.value)} placeholder="Ej. $25" />
                  <Input label="Seniors" value={form.priceSenior} onChange={(e) => set('priceSenior', e.target.value)} placeholder="Ej. $35" />
                </div>
                <p className="mt-1 text-xs text-slate-400">El precio de adultos se usa como referencia en las tarjetas.</p>
              </div>
              <div>
                <label className={labelClass}>Idiomas</label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_LANGS.map((l) => {
                    const active = form.languages.includes(l.value);
                    return (
                      <button type="button" key={l.value} onClick={() => toggleLang(l.value)}
                        className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${active ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-300 text-slate-600 hover:border-slate-400'}`}>
                        {l.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className={labelClass}>Actividades</label>
                <div className="flex flex-wrap gap-2">
                  {activities.map((a) => {
                    const active = form.activities.includes(a.id);
                    return (
                      <button type="button" key={a.id} onClick={() => toggleActivity(a.id)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${active ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-300 text-slate-600 hover:border-slate-400'}`}>
                        <Icon name={resolveIcon(a.icon)} className="h-3.5 w-3.5" /> {a.name_es || a.name_en}
                      </button>
                    );
                  })}
                  {activities.length === 0 && <span className="text-sm text-slate-400">Sin actividades disponibles.</span>}
                </div>
              </div>
            </div>
          )}

          {/* ── MULTIMEDIA ── */}
          {formTab === 'multimedia' && (
            <div className="space-y-5">
              <ImageUploader label="Imagen principal" value={form.image} folder="tours" onChange={(url) => set('image', url)} />
              <div>
                <label className={labelClass}>Galería de fotos</label>
                <GalleryUploader items={form.gallery} folder="tours" onChange={(urls) => set('gallery', urls)} />
              </div>
            </div>
          )}

          {/* ── ITINERARIO ── */}
          {formTab === 'itinerario' && (
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Itinerario</label>
                <div className="space-y-3">
                  {form.itinerary.map((s, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex gap-2">
                        <input value={s.time} onChange={(e) => set('itinerary', form.itinerary.map((x, idx) => idx === i ? { ...x, time: e.target.value } : x))} className={`${fieldClass} w-28`} placeholder="09:00" />
                        <input value={s.activity} onChange={(e) => set('itinerary', form.itinerary.map((x, idx) => idx === i ? { ...x, activity: e.target.value } : x))} className={fieldClass} placeholder="Actividad" />
                        <button type="button" onClick={() => set('itinerary', form.itinerary.filter((_, idx) => idx !== i))} className="rounded-lg px-2 text-slate-400 hover:bg-red-50 hover:text-red-500">
                          <Icon name="close" className="h-4 w-4" />
                        </button>
                      </div>
                      <textarea value={s.description} onChange={(e) => set('itinerary', form.itinerary.map((x, idx) => idx === i ? { ...x, description: e.target.value } : x))} rows={2} className={`${fieldClass} mt-2 resize-none`} placeholder="Descripción" />
                    </div>
                  ))}
                  <button type="button" onClick={() => set('itinerary', [...form.itinerary, { time: '', activity: '', description: '' }])} className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700">
                    <Icon name="plus" className="h-4 w-4" /> Agregar parada
                  </button>
                </div>
              </div>
              <StringList label="Puntos destacados" items={form.highlights} onChange={(v) => set('highlights', v)} placeholder="Destacado" />
            </div>
          )}

          {/* ── INCLUYE ── */}
          {formTab === 'incluye' && (
            <div className="space-y-6">
              <StringList label="Lo que incluye" items={form.includes} onChange={(v) => set('includes', v)} placeholder="Incluye" />
              <StringList label="Qué llevar" items={form.whatToBring} onChange={(v) => set('whatToBring', v)} placeholder="Ítem" />
              <StringList label="Recomendaciones" items={form.recommendations} onChange={(v) => set('recommendations', v)} placeholder="Recomendación" />
              <StringList label="No apto para" items={form.notSuitableFor} onChange={(v) => set('notSuitableFor', v)} placeholder="Restricción" />
            </div>
          )}

          {/* ── POLÍTICAS ── */}
          {formTab === 'politicas' && (
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Fechas disponibles</label>
                <div className="space-y-2">
                  {form.availableDates.map((d, i) => (
                    <div key={i} className="flex gap-2">
                      <input type="date" value={d.date} onChange={(e) => set('availableDates', form.availableDates.map((x, idx) => idx === i ? { ...x, date: e.target.value } : x))} className={fieldClass} />
                      <input type="number" min={0} value={d.spots} onChange={(e) => set('availableDates', form.availableDates.map((x, idx) => idx === i ? { ...x, spots: Number(e.target.value) } : x))} className={`${fieldClass} w-28`} placeholder="Plazas" />
                      <button type="button" onClick={() => set('availableDates', form.availableDates.filter((_, idx) => idx !== i))} className="rounded-lg px-2 text-slate-400 hover:bg-red-50 hover:text-red-500">
                        <Icon name="close" className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => set('availableDates', [...form.availableDates, { date: '', spots: 10 }])} className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700">
                    <Icon name="plus" className="h-4 w-4" /> Agregar fecha
                  </button>
                </div>
              </div>

              <StringList label="Condiciones generales" items={form.conditions} onChange={(v) => set('conditions', v)} placeholder="Condición" />

              <div>
                <label className={labelClass}>Penalidades (política de cancelación)</label>
                <div className="space-y-3">
                  {form.penalties.map((p, i) => (
                    <div key={i} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex gap-2">
                        <input value={p.window} onChange={(e) => set('penalties', form.penalties.map((x, idx) => idx === i ? { ...x, window: e.target.value } : x))} className={fieldClass} placeholder="Ventana (ej. Más de 7 días antes)" />
                        <select value={p.tone} onChange={(e) => set('penalties', form.penalties.map((x, idx) => idx === i ? { ...x, tone: e.target.value as Penalty['tone'] } : x))} className={`${fieldClass} w-40`}>
                          <option value="ok">Verde (sin penalidad)</option>
                          <option value="warn">Ámbar (parcial)</option>
                          <option value="bad">Rojo (sin reembolso)</option>
                        </select>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <input value={p.penalty} onChange={(e) => set('penalties', form.penalties.map((x, idx) => idx === i ? { ...x, penalty: e.target.value } : x))} className={fieldClass} placeholder="Penalidad (ej. Penalidad del 50%)" />
                        <input value={p.refund} onChange={(e) => set('penalties', form.penalties.map((x, idx) => idx === i ? { ...x, refund: e.target.value } : x))} className={fieldClass} placeholder="Reembolso (ej. Reembolso del 100%)" />
                        <button type="button" onClick={() => set('penalties', form.penalties.filter((_, idx) => idx !== i))} className="rounded-lg px-2 text-slate-400 hover:bg-red-50 hover:text-red-500">
                          <Icon name="close" className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => set('penalties', [...form.penalties, { window: '', penalty: '', refund: '', tone: 'warn' }])} className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700">
                    <Icon name="plus" className="h-4 w-4" /> Agregar tramo
                  </button>
                </div>
              </div>

              <div>
                <label className={labelClass}>Porcentajes de pago permitidos</label>
                <p className="mb-2 text-xs text-slate-500">El cliente podrá abonar hoy uno de estos porcentajes (ej. 25, 50, 100).</p>
                <div className="flex flex-wrap items-center gap-2">
                  {form.paymentOptions.map((p, i) => (
                    <div key={i} className="flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1">
                      <input type="number" min={1} max={100} value={p} onChange={(e) => set('paymentOptions', form.paymentOptions.map((x, idx) => idx === i ? Math.max(1, Math.min(100, Number(e.target.value) || 0)) : x))} className="w-16 text-sm focus:outline-none" />
                      <span className="text-sm text-slate-500">%</span>
                      <button type="button" onClick={() => set('paymentOptions', form.paymentOptions.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500">
                        <Icon name="close" className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => set('paymentOptions', [...form.paymentOptions, 100])} className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700">
                    <Icon name="plus" className="h-4 w-4" /> Agregar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="mt-5 flex items-center justify-end gap-3 pb-6">
          <button type="button" onClick={() => { setForm({ ...EMPTY_FORM }); setCitiesDb([]); setFormTab('resumen'); }} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
            Limpiar
          </button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50">
            <Icon name="check" className="h-4 w-4" /> {saving ? 'Guardando…' : (editingId ? 'Guardar cambios' : 'Crear tour')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CityToursApi;
