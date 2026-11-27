import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import Icon, { resolveIcon } from '../components/Icon';
import ApprovalBadge, { ApprovalNotice } from '../components/ApprovalBadge';
import { ImageUploader, GalleryUploader } from '../components/ImageUploader';
import RichTextEditor from '../components/RichTextEditor';
import LocationMapModal from '../components/LocationMapModal';
import {
  listPois, getPoi, createPoi, updatePoi, deletePoi,
  type POI, type POIPayload,
} from '../services/pois';
import { apiErrorMessage } from '../lib/apiError';
import { ChipPicker } from '../components/FormFields';
import {
  AdmissionEditor, Block, MonthsPicker, OptionChips, RowsEditor, ScheduleEditor, Tabs, TagSelector, TextList,
  type ScheduleBlock,
} from '../components/EditorKit';
import { asList, cleanAdmission, cleanList, toAdmission, type Admission } from '../lib/editorData';
import { fieldClass, labelClass, toSlug, toggleId } from '../lib/forms';

// Propuestas de POI del socio, con la ficha completa: lo mismo que se puede
// rellenar en el panel admin salvo lo que decide la plataforma (valoración,
// secciones del menú, borrador y ofertas de revendedores). Todo va a revisión.

interface Place { id: number; name: string }
interface NamedCatalog { id: number; name_en: string; name_es: string; is_active?: boolean }
interface CategoryDb { id: number; name_en: string; name_es: string; icon: string; is_active: boolean }
interface TagOption { label: string; icon?: string }
interface Stop { title: string; description: string; duration: string; admission_included: boolean; [k: string]: unknown }
interface Penalty { window: string; penalty: string; refund: string; [k: string]: unknown }
interface DateSlot { date: string; spots: number | ''; [k: string]: unknown }

const PAGE_SIZE = 10;
const LANGUAGE_OPTIONS = ['Español', 'Inglés', 'Francés', 'Alemán', 'Italiano', 'Portugués', 'Ruso'];
const ACCESSIBILITY_OPTIONS = ['Accesible en silla de ruedas', 'Accesible con cochecito', 'Se admiten animales de servicio', 'Cerca del transporte público', 'Superficie principalmente llana'];
const DIFFICULTY = [['', 'Sin indicar'], ['easy', 'Fácil'], ['moderate', 'Moderada'], ['hard', 'Difícil'], ['extreme', 'Alta']];

type FormTab = 'general' | 'visit' | 'place' | 'tags' | 'product' | 'rules';
const TABS: { key: FormTab; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'visit', label: 'Entrada y horarios' },
  { key: 'place', label: 'Ubicación y contacto' },
  { key: 'tags', label: 'Etiquetas' },
  { key: 'product', label: 'Producto' },
  { key: 'rules', label: 'Condiciones y reserva' },
];

const EMPTY_FORM = () => ({
  name: '', slug: '', slugTouched: false, category_id: '' as number | '',
  country: '', city_id: '' as number | '', city_ids: [] as number[],
  description: '', location: '', featured_info: '', about: '', highlights: [] as string[],
  image: '', gallery: [] as string[],
  latitude: '', longitude: '',
  is_national_park: false, is_unesco: false, is_active: true,
  operator: '',
  activity_ids: [] as number[], travel_style_ids: [] as number[],
  environment_nature: [] as string[], infrastructure_comodidades: [] as string[],
  admission: { free: false, notes: [], tiers: [] } as Admission,
  schedule: [] as ScheduleBlock[], schedule_notes: [] as string[],
  best_months: [] as number[], best_months_notes: '',
  practical: { duration: '', ideal_for: '', difficulty: '', difficulty_notes: '', how_to_arrive: [] as string[], recommendations: [] as string[] },
  contact: { phone: '', email: '', website: '', instagram: '', facebook: '', tiktok: '', address: '' } as Record<string, string>,
  tips: [] as string[],
  // Producto (si el lugar se vende como experiencia).
  meeting_point: '', pickup_offered: false, pickup_areas: [] as string[], return_details: '',
  duration_hours: '', start_times: [] as string[], available_dates: [] as DateSlot[],
  languages: [] as string[], min_participants: '', max_group: '',
  price_from: '', currency: 'USD',
  includes: [] as string[], not_includes: [] as string[], itinerary: [] as Stop[], what_to_bring: [] as string[],
  // Condiciones y reserva.
  min_age: '', max_age: '', not_suitable_for: [] as string[], accessibility: [] as string[],
  conditions: [] as string[], health_safety: [] as string[],
  cancellation_policy: '', penalties: [] as Penalty[], booking_policies: [] as string[],
  instant_confirmation: false, mobile_ticket: false,
});
type FormState = ReturnType<typeof EMPTY_FORM>;

const str = (v: unknown) => (v == null ? '' : String(v));
const numOrNull = (v: string) => (v.trim() === '' ? null : Number(v));

function toForm(p: POI): FormState {
  const pi = (p.practical_info ?? {}) as Record<string, unknown>;
  const contact = (p.contact ?? {}) as Record<string, string>;
  const base = EMPTY_FORM();
  return {
    ...base,
    name: p.name ?? '', slug: p.slug ?? '', slugTouched: true, category_id: p.category?.id ?? '',
    country: p.country?.name ?? '', city_id: p.city?.id ?? '', city_ids: (p.cities ?? []).map((c) => c.id),
    description: p.description ?? '', location: p.location ?? '', featured_info: p.featured_info ?? '',
    about: str(p.about), highlights: asList(p.highlights),
    image: p.image ?? '', gallery: p.photos ?? [],
    latitude: p.latitude ? String(p.latitude) : '', longitude: p.longitude ? String(p.longitude) : '',
    is_national_park: p.is_national_park, is_unesco: p.is_unesco, is_active: p.is_active,
    operator: p.operator ?? '',
    activity_ids: (p.activities ?? []).map((a) => a.id), travel_style_ids: (p.travel_styles ?? []).map((t) => t.id),
    environment_nature: asList(p.environment_nature), infrastructure_comodidades: asList(p.infrastructure_comodidades),
    admission: toAdmission(p.admission),
    schedule: Array.isArray(p.schedule) ? (p.schedule as ScheduleBlock[]) : [], schedule_notes: asList(p.schedule_notes),
    best_months: Array.isArray(p.best_months) ? (p.best_months as number[]) : [], best_months_notes: str(p.best_months_notes),
    practical: {
      duration: str(pi.duration), ideal_for: str(pi.ideal_for), difficulty: str(pi.difficulty), difficulty_notes: str(pi.difficulty_notes),
      how_to_arrive: asList(pi.how_to_arrive), recommendations: asList(pi.recommendations),
    },
    contact: { ...base.contact, ...contact },
    tips: asList(p.tips),
    meeting_point: str(p.meeting_point), pickup_offered: !!p.pickup_offered, pickup_areas: asList(p.pickup_areas), return_details: str(p.return_details),
    duration_hours: str(p.duration_hours), start_times: asList(p.start_times),
    available_dates: Array.isArray(p.available_dates) ? (p.available_dates as DateSlot[]) : [],
    languages: asList(p.languages), min_participants: str(p.min_participants), max_group: str(p.max_group),
    price_from: str(p.price_from), currency: str(p.currency) || 'USD',
    includes: asList(p.includes), not_includes: asList(p.not_includes),
    itinerary: Array.isArray(p.itinerary) ? (p.itinerary as Stop[]) : [], what_to_bring: asList(p.what_to_bring),
    min_age: str(p.min_age), max_age: str(p.max_age), not_suitable_for: asList(p.not_suitable_for), accessibility: asList(p.accessibility),
    conditions: asList(p.conditions), health_safety: asList(p.health_safety),
    cancellation_policy: str(p.cancellation_policy), penalties: Array.isArray(p.penalties) ? (p.penalties as Penalty[]) : [],
    booking_policies: asList(p.booking_policies), instant_confirmation: !!p.instant_confirmation, mobile_ticket: !!p.mobile_ticket,
  };
}

function toPayload(form: FormState, countryId: number | null): POIPayload {
  return {
    name: form.name.trim(),
    slug: (form.slug || toSlug(form.name)).trim() || undefined,
    category_id: Number(form.category_id),
    description: form.description, location: form.location, featured_info: form.featured_info,
    about: form.about, highlights: cleanList(form.highlights),
    image: form.image, photos: form.gallery.filter(Boolean),
    latitude: Number(form.latitude) || 0, longitude: Number(form.longitude) || 0,
    is_national_park: form.is_national_park, is_unesco: form.is_unesco, is_active: form.is_active,
    country_id: countryId, city_id: form.city_id === '' ? null : Number(form.city_id), city_ids: form.city_ids,
    operator: form.operator.trim(),
    activity_ids: form.activity_ids, travel_style_ids: form.travel_style_ids,
    environment_nature: form.environment_nature, infrastructure_comodidades: form.infrastructure_comodidades,
    admission: cleanAdmission(form.admission),
    schedule: form.schedule.filter((b) => b.days.length > 0), schedule_notes: cleanList(form.schedule_notes),
    best_months: form.best_months, best_months_notes: form.best_months_notes,
    practical_info: { ...form.practical, how_to_arrive: cleanList(form.practical.how_to_arrive), recommendations: cleanList(form.practical.recommendations) },
    contact: Object.fromEntries(Object.entries(form.contact).map(([k, v]) => [k, v.trim()])),
    tips: cleanList(form.tips),
    meeting_point: form.meeting_point, pickup_offered: form.pickup_offered, pickup_areas: cleanList(form.pickup_areas), return_details: form.return_details,
    duration_hours: numOrNull(form.duration_hours), start_times: cleanList(form.start_times),
    available_dates: form.available_dates.filter((d) => d.date).map((d) => ({ date: d.date, spots: d.spots === '' ? null : Number(d.spots) })),
    languages: form.languages, min_participants: numOrNull(form.min_participants), max_group: numOrNull(form.max_group),
    price_from: numOrNull(form.price_from), currency: form.currency,
    includes: cleanList(form.includes), not_includes: cleanList(form.not_includes),
    itinerary: form.itinerary.filter((s) => String(s.title).trim()), what_to_bring: cleanList(form.what_to_bring),
    min_age: numOrNull(form.min_age), max_age: numOrNull(form.max_age),
    not_suitable_for: cleanList(form.not_suitable_for), accessibility: form.accessibility,
    conditions: cleanList(form.conditions), health_safety: cleanList(form.health_safety),
    cancellation_policy: form.cancellation_policy, penalties: form.penalties.filter((x) => String(x.window).trim()),
    booking_policies: cleanList(form.booking_policies),
    instant_confirmation: form.instant_confirmation, mobile_ticket: form.mobile_ticket,
  };
}

function POIs() {
  const { t, i18n } = useTranslation();
  const en = i18n.language.startsWith('en');

  const [items, setItems] = useState<POI[]>([]);
  const [categories, setCategories] = useState<CategoryDb[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<number | ''>('');
  const [currentPage, setCurrentPage] = useState(1);

  const [view, setView] = useState<'list' | 'form'>('list');
  const [tab, setTab] = useState<FormTab>('general');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM());
  const [mapOpen, setMapOpen] = useState(false);

  const [activitiesDb, setActivitiesDb] = useState<NamedCatalog[]>([]);
  const [stylesDb, setStylesDb] = useState<NamedCatalog[]>([]);
  const [countriesDb, setCountriesDb] = useState<Place[]>([]);
  const [citiesDb, setCitiesDb] = useState<Place[]>([]);
  const [envOptions, setEnvOptions] = useState<TagOption[]>([]);
  const [infraOptions, setInfraOptions] = useState<TagOption[]>([]);

  const catName = (c: CategoryDb) => (en ? c.name_en : c.name_es) || c.name_es || c.name_en;

  const load = () => {
    setLoading(true);
    listPois()
      .then((data) => { setItems(data); setError(''); })
      .catch(() => setError(t('common.loadError', 'No se pudieron cargar los POIs.')))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
    const toTags = (d: unknown): TagOption[] => ((Array.isArray(d) ? d : []) as { name: string; icon?: string; is_active?: boolean }[])
      .filter((x) => x.is_active !== false).map((x) => ({ label: x.name, icon: x.icon }));
    api.get('/categories/').then(({ data }) => setCategories(data)).catch(() => setCategories([]));
    api.get('/countries/').then(({ data }) => setCountriesDb(data)).catch(() => setCountriesDb([]));
    // Actividades y estilos de viaje salen de la BD (regla del proyecto).
    // Solo los tipos genéricos: las actividades comerciales (kind='venue') no son etiquetas.
    api.get('/activities/', { params: { kind: 'type', brief: '1' } })
      .then(({ data }) => setActivitiesDb(data)).catch(() => setActivitiesDb([]));
    api.get('/travel-styles/').then(({ data }) => setStylesDb(data)).catch(() => setStylesDb([]));
    api.get('/poi-features/', { params: { kind: 'environment' } }).then(({ data }) => setEnvOptions(toTags(data))).catch(() => setEnvOptions([]));
    api.get('/poi-features/', { params: { kind: 'infrastructure' } }).then(({ data }) => setInfraOptions(toTags(data))).catch(() => setInfraOptions([]));
    // eslint-disable-next-line
  }, []);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setPractical = (k: keyof FormState['practical'], v: string | string[]) => setForm((f) => ({ ...f, practical: { ...f.practical, [k]: v } }));
  const setContact = (k: string, v: string) => setForm((f) => ({ ...f, contact: { ...f.contact, [k]: v } }));

  const loadCities = async (countryName: string) => {
    const country = countriesDb.find((c) => c.name === countryName);
    if (!country) { setCitiesDb([]); return; }
    try { const { data } = await api.get(`/cities/?country_id=${country.id}`); setCitiesDb(data); } catch { setCitiesDb([]); }
  };
  const onCountryChange = (name: string) => {
    setForm((f) => ({ ...f, country: name, city_id: '', city_ids: [] }));
    void loadCities(name);
  };

  const startCreate = () => { setError(''); setSuccess(''); setForm(EMPTY_FORM()); setCitiesDb([]); setEditingId(null); setTab('general'); setView('form'); };

  const startEdit = async (id: number) => {
    setError(''); setSuccess('');
    try {
      const p = await getPoi(id);
      setForm(toForm(p));
      await loadCities(p.country?.name ?? '');
      setEditingId(id); setTab('general'); setView('form');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) { setError(apiErrorMessage(err, 'No se pudo cargar el POI para editar.')); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setTab('general'); setError('El nombre es obligatorio.'); return; }
    if (form.category_id === '') { setTab('general'); setError('La categoría es obligatoria.'); return; }
    setSaving(true);
    const country = countriesDb.find((c) => c.name === form.country);
    const payload = toPayload(form, country ? country.id : null);
    try {
      if (editingId) { await updatePoi(editingId, payload); setSuccess('POI actualizado.'); }
      else { await createPoi(payload); setSuccess('POI creado.'); }
      setView('list'); setEditingId(null); load();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo guardar el POI. Revisa los campos obligatorios.'));
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    setError('');
    try { await deletePoi(id); setDeleteId(null); setSuccess('POI eliminado.'); load(); }
    catch { setDeleteId(null); setError('No se pudo eliminar el POI.'); }
  };

  // Una propuesta solo se puede corregir mientras el administrador no la haya
  // revisado; lo aprobado se gestiona desde el panel admin.
  const canEdit = (p: POI) => p.approval_status === 'pending' || p.approval_status === 'rejected';

  const filtered = items.filter((p) => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.location ?? '').toLowerCase().includes(q) || (p.city?.name ?? '').toLowerCase().includes(q);
    const matchCat = !filterCat || p.category?.id === filterCat;
    return matchSearch && matchCat;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const isFiltered = !!search.trim() || !!filterCat;

  const catLabel = (p: POI) => {
    if (!p.category) return '—';
    return (en ? p.category.name_en : p.category.name_es) || p.category.name_es || p.category.name_en;
  };

  const check = (label: string, checked: boolean, onChange: (v: boolean) => void) => (
    <label className="flex cursor-pointer items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-emerald-600" />
      <span className="text-sm font-medium text-slate-600">{label}</span>
    </label>
  );
  const input = (label: string, value: string, onChange: (v: string) => void, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label className={labelClass}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass} {...extra} />
    </div>
  );

  // ── FORM ──
  if (view === 'form') {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-3">
          <button type="button" onClick={() => { setView('list'); setError(''); setEditingId(null); }}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-900 hover:bg-slate-50">← Volver</button>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
            <Icon name="pin" className="h-6 w-6 text-emerald-600" /> {editingId ? 'Corregir propuesta' : 'Proponer punto de interés'}
          </h1>
          {editingId && <span className="text-sm text-slate-400">ID #{editingId}</span>}
        </div>

        {!editingId && <ApprovalNotice noun="el punto de interés" />}
        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <Tabs tabs={TABS} active={tab} onChange={setTab} />

            {tab === 'general' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Nombre *</label>
                    <input value={form.name} required placeholder="Ej. Faro a Colón"
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.slugTouched ? f.slug : toSlug(e.target.value) }))} className={fieldClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Categoría *</label>
                    <select value={form.category_id} required onChange={(e) => set('category_id', e.target.value ? Number(e.target.value) : '')} className={fieldClass}>
                      <option value="">— Categoría —</option>
                      {categories.filter((c) => c.is_active).map((c) => <option key={c.id} value={c.id}>{catName(c)}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Descripción</label>
                  <textarea value={form.description} rows={4} placeholder="Describe el punto de interés…" onChange={(e) => set('description', e.target.value)} className={fieldClass} />
                </div>
                <div>
                  <label className={labelClass}>Datos destacados <span className="font-normal text-slate-400">(lo que no debe perderse el visitante)</span></label>
                  <RichTextEditor value={form.featured_info} onChange={(v) => set('featured_info', v)} placeholder="Horario recomendado, qué llevar, detalles que marcan la diferencia…" />
                </div>
                <div>
                  <label className={labelClass}>Sobre el lugar <span className="font-normal text-slate-400">(presentación larga, opcional)</span></label>
                  <textarea value={form.about} rows={4} onChange={(e) => set('about', e.target.value)} className={fieldClass} />
                </div>
                <TextList label="Lo más destacado" items={form.highlights} onChange={(v) => set('highlights', v)} placeholder="Ej. Vistas de toda la bahía" />
                {input('Operador (quién gestiona el lugar)', form.operator, (v) => set('operator', v), { placeholder: 'Ej. Ministerio de Medio Ambiente' })}
                <div className="border-t border-slate-100 pt-5">
                  <ImageUploader label="Imagen principal" value={form.image} folder="pois" onChange={(url) => set('image', url)} />
                  <div className="mt-4">
                    <label className={labelClass}>Galería</label>
                    <GalleryUploader items={form.gallery} folder="pois" onChange={(urls) => set('gallery', urls)} />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-6 border-t border-slate-100 pt-5">
                  {check(t('common.active'), form.is_active, (v) => set('is_active', v))}
                  {check('Parque nacional', form.is_national_park, (v) => set('is_national_park', v))}
                  {check('Sitio UNESCO', form.is_unesco, (v) => set('is_unesco', v))}
                </div>
              </div>
            )}

            {tab === 'visit' && (
              <div className="space-y-5">
                <Block title="Precio de entrada" hint="Una tarifa por moneda y tipo de visitante. Deja vacío lo que no aplique.">
                  <AdmissionEditor value={form.admission} onChange={(v) => set('admission', v)} />
                </Block>
                <Block title="Horario">
                  <ScheduleEditor blocks={form.schedule} onChange={(v) => set('schedule', v)} />
                  <TextList label="Notas del horario" items={form.schedule_notes} onChange={(v) => set('schedule_notes', v)} placeholder="Ej. Cerrado los festivos" addLabel="Añadir nota" />
                </Block>
                <Block title="Mejor época">
                  <MonthsPicker label="Meses recomendados" value={form.best_months} onChange={(v) => set('best_months', v)} />
                  {input('Comentario', form.best_months_notes, (v) => set('best_months_notes', v), { placeholder: 'Ej. De diciembre a abril, temporada seca' })}
                </Block>
                <Block title="Datos prácticos">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {input('Duración de la visita', form.practical.duration, (v) => setPractical('duration', v), { placeholder: 'Ej. 2–3 horas' })}
                    {input('Ideal para', form.practical.ideal_for, (v) => setPractical('ideal_for', v), { placeholder: 'Ej. Familias y fotógrafos' })}
                    <div>
                      <label className={labelClass}>Dificultad</label>
                      <select value={form.practical.difficulty} onChange={(e) => setPractical('difficulty', e.target.value)} className={fieldClass}>
                        {DIFFICULTY.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    {input('Sobre la dificultad', form.practical.difficulty_notes, (v) => setPractical('difficulty_notes', v), { placeholder: 'Ej. Escaleras en el último tramo' })}
                  </div>
                  <TextList label="Cómo llegar" items={form.practical.how_to_arrive} onChange={(v) => setPractical('how_to_arrive', v)} placeholder="Ej. En guagua desde el parque central" />
                  <TextList label="Recomendaciones" items={form.practical.recommendations} onChange={(v) => setPractical('recommendations', v)} placeholder="Ej. Ve temprano para evitar el calor" />
                </Block>
                <TextList label="Consejos para el visitante" items={form.tips} onChange={(v) => set('tips', v)} placeholder="Ej. Lleva calzado cerrado" addLabel="Añadir consejo" />
              </div>
            )}

            {tab === 'place' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>País</label>
                    <select value={form.country} onChange={(e) => onCountryChange(e.target.value)} className={fieldClass}>
                      <option value="">— País —</option>
                      {countriesDb.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Ciudad / provincia principal</label>
                    <select value={form.city_id} disabled={!form.country} onChange={(e) => set('city_id', e.target.value ? Number(e.target.value) : '')}
                      className={`${fieldClass} disabled:bg-slate-50 disabled:text-slate-400`}>
                      <option value="">{form.country ? '— Ciudad —' : 'Elige país'}</option>
                      {citiesDb.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                {citiesDb.length > 0 && (
                  <ChipPicker label="Otras ciudades que abarca (si está en la frontera de varias)"
                    options={citiesDb.filter((c) => c.id !== form.city_id).map((c) => ({ id: c.id, name_es: c.name, name_en: c.name }))}
                    selected={form.city_ids} onToggle={(id) => set('city_ids', toggleId(form.city_ids, id))} />
                )}
                {input('Ubicación (texto)', form.location, (v) => set('location', v), { placeholder: 'Ej. Av. España, Santo Domingo Este' })}
                <div className="flex flex-wrap items-end gap-3">
                  <div className="w-40">{input('Latitud', form.latitude, (v) => set('latitude', v), { type: 'number', step: 'any', placeholder: '18.4761' })}</div>
                  <div className="w-40">{input('Longitud', form.longitude, (v) => set('longitude', v), { type: 'number', step: 'any', placeholder: '-69.8674' })}</div>
                  <button type="button" onClick={() => setMapOpen(true)} className="mb-0.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-900">
                    <Icon name="map" className="h-4 w-4" /> Marcar en el mapa
                  </button>
                </div>
                <Block title="Contacto">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[['phone', 'Teléfono'], ['email', 'Correo'], ['website', 'Web'], ['address', 'Dirección'], ['instagram', 'Instagram'], ['facebook', 'Facebook'], ['tiktok', 'TikTok']].map(([k, l]) => (
                      <div key={k}>{input(l, form.contact[k] ?? '', (v) => setContact(k, v))}</div>
                    ))}
                  </div>
                </Block>
              </div>
            )}

            {tab === 'tags' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ChipPicker label="Actividades" options={activitiesDb} selected={form.activity_ids} onToggle={(id) => set('activity_ids', toggleId(form.activity_ids, id))} />
                  <ChipPicker label="Estilos de viaje" options={stylesDb} selected={form.travel_style_ids} onToggle={(id) => set('travel_style_ids', toggleId(form.travel_style_ids, id))} />
                </div>
                <TagSelector label="Entorno y naturaleza" options={envOptions} selected={form.environment_nature} onChange={(v) => set('environment_nature', v)} />
                <TagSelector label="Infraestructura y comodidades" options={infraOptions} selected={form.infrastructure_comodidades} onChange={(v) => set('infrastructure_comodidades', v)} />
              </div>
            )}

            {tab === 'product' && (
              <div className="space-y-5">
                <p className="text-sm text-slate-500">Solo si el lugar se vende como experiencia (entrada con guía, excursión…). Si no, deja esta pestaña vacía.</p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {input('Precio desde', form.price_from, (v) => set('price_from', v), { type: 'number', min: 0, step: '0.01' })}
                  <div>
                    <label className={labelClass}>Moneda</label>
                    <select value={form.currency} onChange={(e) => set('currency', e.target.value)} className={fieldClass}>
                      {['USD', 'DOP', 'EUR'].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  {input('Duración (horas)', form.duration_hours, (v) => set('duration_hours', v), { type: 'number', min: 0, step: '0.5' })}
                  {input('Grupo máximo', form.max_group, (v) => set('max_group', v), { type: 'number', min: 1 })}
                  {input('Mínimo de personas', form.min_participants, (v) => set('min_participants', v), { type: 'number', min: 1 })}
                </div>
                <OptionChips label="Idiomas" options={LANGUAGE_OPTIONS} selected={form.languages} onChange={(v) => set('languages', v)} />
                <TextList label="Horas de salida" items={form.start_times} onChange={(v) => set('start_times', v)} placeholder="Ej. 08:30" />
                <RowsEditor<DateSlot> label="Fechas disponibles" rows={form.available_dates} onChange={(v) => set('available_dates', v)}
                  empty={() => ({ date: '', spots: '' })} addLabel="Añadir fecha"
                  columns={[{ key: 'date', label: 'Fecha', type: 'date' }, { key: 'spots', label: 'Plazas', type: 'number' }]} />
                {input('Punto de encuentro', form.meeting_point, (v) => set('meeting_point', v))}
                {check('Ofrece recogida', form.pickup_offered, (v) => set('pickup_offered', v))}
                {form.pickup_offered && <TextList label="Zonas de recogida" items={form.pickup_areas} onChange={(v) => set('pickup_areas', v)} placeholder="Ej. Hoteles de Bávaro" />}
                {input('Regreso', form.return_details, (v) => set('return_details', v), { placeholder: 'Ej. Al mismo punto de encuentro' })}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <TextList label="Incluye" items={form.includes} onChange={(v) => set('includes', v)} placeholder="Ej. Entrada" />
                  <TextList label="No incluye" items={form.not_includes} onChange={(v) => set('not_includes', v)} placeholder="Ej. Propinas" />
                </div>
                <TextList label="Qué llevar" items={form.what_to_bring} onChange={(v) => set('what_to_bring', v)} placeholder="Ej. Protector solar" />
                <RowsEditor<Stop> label="Recorrido (paradas)" rows={form.itinerary} onChange={(v) => set('itinerary', v)}
                  empty={() => ({ title: '', description: '', duration: '', admission_included: false })} addLabel="Añadir parada"
                  columns={[{ key: 'title', label: 'Parada', wide: true }, { key: 'description', label: 'Descripción', wide: true }, { key: 'duration', label: 'Duración' }, { key: 'admission_included', label: 'Entrada incluida', type: 'checkbox' }]} />
              </div>
            )}

            {tab === 'rules' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4 sm:max-w-md">
                  {input('Edad mínima', form.min_age, (v) => set('min_age', v), { type: 'number', min: 0 })}
                  {input('Edad máxima', form.max_age, (v) => set('max_age', v), { type: 'number', min: 0 })}
                </div>
                <TextList label="No recomendado para" items={form.not_suitable_for} onChange={(v) => set('not_suitable_for', v)} placeholder="Ej. Personas con vértigo" />
                <OptionChips label="Accesibilidad" options={ACCESSIBILITY_OPTIONS} selected={form.accessibility} onChange={(v) => set('accessibility', v)} />
                <TextList label="Condiciones" items={form.conditions} onChange={(v) => set('conditions', v)} placeholder="Ej. Se requiere saber nadar" />
                <TextList label="Salud y seguridad" items={form.health_safety} onChange={(v) => set('health_safety', v)} placeholder="Ej. Chaleco salvavidas obligatorio" />
                <div>
                  <label className={labelClass}>Política de cancelación</label>
                  <textarea value={form.cancellation_policy} rows={3} onChange={(e) => set('cancellation_policy', e.target.value)} className={fieldClass} />
                </div>
                <RowsEditor<Penalty> label="Penalizaciones por cancelación" rows={form.penalties} onChange={(v) => set('penalties', v)}
                  empty={() => ({ window: '', penalty: '', refund: '' })} addLabel="Añadir tramo"
                  columns={[{ key: 'window', label: 'Cuándo', wide: true }, { key: 'penalty', label: 'Penalización' }, { key: 'refund', label: 'Reembolso' }]} />
                <TextList label="Políticas de reserva" items={form.booking_policies} onChange={(v) => set('booking_policies', v)} placeholder="Ej. Reserva con 24 h de antelación" />
                <div className="flex flex-wrap gap-6">
                  {check('Confirmación inmediata', form.instant_confirmation, (v) => set('instant_confirmation', v))}
                  {check('Entrada en el móvil', form.mobile_ticket, (v) => set('mobile_ticket', v))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center justify-end gap-3 pb-6">
            <button type="button" onClick={() => { setView('list'); setError(''); setEditingId(null); }}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">{t('common.cancel')}</button>
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50">
              <Icon name="check" className="h-4 w-4" />
              {saving ? t('common.saving', 'Guardando…') : editingId ? t('common.save') : 'Crear POI'}
            </button>
          </div>
        </form>

        {mapOpen && (
          <LocationMapModal open name={form.name} lat={Number(form.latitude) || 0} lng={Number(form.longitude) || 0}
            onClose={() => setMapOpen(false)}
            onChange={(lat, lng) => { set('latitude', lat.toFixed(6)); set('longitude', lng.toFixed(6)); }} />
        )}
      </div>
    );
  }

  // ── LISTA ──
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
            <Icon name="pin" className="h-6 w-6 text-emerald-600" /> Mis propuestas de POI
          </h1>
          <p className="mt-1 text-sm text-slate-500">{filtered.length} {filtered.length === 1 ? 'punto de interés' : 'puntos de interés'}{isFiltered ? ' (filtrados)' : ' en total'}</p>
        </div>
        <button type="button" onClick={startCreate}
          className="inline-flex items-center gap-2 self-start rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 sm:self-auto">
          <Icon name="plus" className="h-4 w-4" /> Proponer POI
        </button>
      </div>

      {success && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>}
      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Buscar por nombre, ubicación o ciudad…"
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
        </div>
        <select value={filterCat} onChange={(e) => { setFilterCat(e.target.value ? Number(e.target.value) : ''); setCurrentPage(1); }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:w-56">
          <option value="">Todas las categorías</option>
          {categories.filter((c) => c.is_active).map((c) => <option key={c.id} value={c.id}>{catName(c)}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">{t('common.loading', 'Cargando…')}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400"><Icon name="pin" className="h-6 w-6" /></div>
          <h3 className="text-base font-semibold text-slate-900">{items.length === 0 ? 'Aún no hay POIs' : 'Ningún POI coincide con el filtro'}</h3>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr><th className="px-4 py-3">POI</th><th className="px-4 py-3">Categoría</th><th className="px-4 py-3">Ciudad</th><th className="px-4 py-3">{t('common.status')}</th><th className="px-4 py-3 text-right">{t('common.actions')}</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 flex-shrink-0 overflow-hidden rounded-md bg-slate-100">
                          {p.image && <img src={p.image} alt="" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800">{p.name}</p>
                          {(p.is_unesco || p.is_national_park) && (
                            <p className="truncate text-xs text-slate-400">{[p.is_unesco && 'UNESCO', p.is_national_park && 'Parque nacional'].filter(Boolean).join(' · ')}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        {p.category?.icon && <Icon name={resolveIcon(p.category.icon)} className="h-4 w-4 text-slate-400" />}
                        {catLabel(p)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.city?.name || p.country?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${p.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{p.is_active ? t('common.active') : t('common.inactive')}</span>
                        <ApprovalBadge status={p.approval_status} note={p.approval_note} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {deleteId === p.id ? (
                        <span className="inline-flex items-center gap-2 whitespace-nowrap">
                          <button type="button" onClick={() => handleDelete(p.id)} className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-600">{t('common.delete')}</button>
                          <button type="button" onClick={() => setDeleteId(null)} className="text-xs text-slate-500 hover:text-slate-800">{t('common.cancel')}</button>
                        </span>
                      ) : (
                        canEdit(p) ? (
                          <span className="inline-flex items-center gap-1 whitespace-nowrap">
                            <button type="button" onClick={() => startEdit(p.id)} title="Corregir propuesta" className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"><Icon name="pencil" className="h-4 w-4" /></button>
                            <button type="button" onClick={() => setDeleteId(p.id)} title="Retirar propuesta" className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"><Icon name="close" className="h-4 w-4" /></button>
                          </span>
                        ) : (
                          <span className="whitespace-nowrap text-xs text-slate-400">Aprobado · lo gestiona el administrador</span>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button type="button" onClick={() => setCurrentPage((p) => p - 1)} disabled={page === 1}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:bg-transparent">{t('common.previous')}</button>
              <span className="text-sm text-slate-500">{t('common.pageOf', { current: page, total: totalPages })}</span>
              <button type="button" onClick={() => setCurrentPage((p) => p + 1)} disabled={page === totalPages}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:bg-transparent">{t('common.next')}</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default POIs;
