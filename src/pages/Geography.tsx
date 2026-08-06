import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../components/Icon';
import {
  listCountries, createCountry, updateCountry, deleteCountry,
  listCities, createCity, updateCity, deleteCity,
  type Country, type City,
} from '../services/geography';

// Gestión del catálogo geográfico (países y ciudades) en dos pestañas. Las
// ciudades se filtran por país (cascada). Diseño sobrio consistente con buzz.

type Tab = 'countries' | 'cities';

const fieldClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';

function Geography() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('countries');

  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Formularios de alta
  const [newCountry, setNewCountry] = useState({ name: '', code: '' });
  const [newCity, setNewCity] = useState({ name: '', country: '' as number | '' });
  const [filterCountry, setFilterCountry] = useState<number | ''>('');

  // Edición inline
  const [editCountry, setEditCountry] = useState<Country | null>(null);
  const [editCity, setEditCity] = useState<City | null>(null);
  const [delCountry, setDelCountry] = useState<number | null>(null);
  const [delCity, setDelCity] = useState<number | null>(null);

  const loadCountries = () =>
    listCountries().then(setCountries).catch(() => setError('No se pudieron cargar los países.'));
  const loadCities = (countryId?: number) =>
    listCities(countryId).then(setCities).catch(() => setError('No se pudieron cargar las ciudades.'));

  useEffect(() => {
    setLoading(true);
    Promise.all([loadCountries(), loadCities()]).finally(() => setLoading(false));
    // eslint-disable-next-line
  }, []);

  const countryName = (id: number) => countries.find((c) => c.id === id)?.name ?? '—';
  const citiesShown = useMemo(
    () => (filterCountry ? cities.filter((c) => c.country === filterCountry) : cities),
    [cities, filterCountry],
  );

  // ── Países ──
  const addCountry = async () => {
    if (!newCountry.name.trim()) return;
    setBusy(true); setError('');
    try {
      await createCountry({ name: newCountry.name.trim(), code: newCountry.code.trim().toUpperCase(), is_active: true });
      setNewCountry({ name: '', code: '' });
      await loadCountries();
    } catch { setError('No se pudo crear el país (¿nombre o código duplicado?).'); }
    finally { setBusy(false); }
  };
  const saveCountry = async () => {
    if (!editCountry) return;
    setBusy(true); setError('');
    try {
      await updateCountry(editCountry.id, { name: editCountry.name.trim(), code: editCountry.code.trim().toUpperCase(), is_active: editCountry.is_active });
      setEditCountry(null);
      await loadCountries();
    } catch { setError('No se pudo actualizar el país.'); }
    finally { setBusy(false); }
  };
  const removeCountry = async (id: number) => {
    setBusy(true); setError('');
    try { await deleteCountry(id); setDelCountry(null); await Promise.all([loadCountries(), loadCities()]); }
    catch { setDelCountry(null); setError('No se pudo eliminar el país (puede tener ciudades asociadas).'); }
    finally { setBusy(false); }
  };

  // ── Ciudades ──
  const addCity = async () => {
    if (!newCity.name.trim() || !newCity.country) return;
    setBusy(true); setError('');
    try {
      await createCity({ name: newCity.name.trim(), country: newCity.country, is_active: true });
      setNewCity({ name: '', country: newCity.country });
      await loadCities();
    } catch { setError('No se pudo crear la ciudad (¿duplicada en ese país?).'); }
    finally { setBusy(false); }
  };
  const saveCity = async () => {
    if (!editCity) return;
    setBusy(true); setError('');
    try {
      await updateCity(editCity.id, { name: editCity.name.trim(), country: editCity.country, is_active: editCity.is_active });
      setEditCity(null);
      await loadCities();
    } catch { setError('No se pudo actualizar la ciudad.'); }
    finally { setBusy(false); }
  };
  const removeCity = async (id: number) => {
    setBusy(true); setError('');
    try { await deleteCity(id); setDelCity(null); await loadCities(); }
    catch { setDelCity(null); setError('No se pudo eliminar la ciudad.'); }
    finally { setBusy(false); }
  };

  const tabCls = (tk: Tab) =>
    `rounded-full px-4 py-2 text-sm font-medium transition-colors ${tab === tk ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`;
  const ActiveBadge = ({ on }: { on: boolean }) => (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${on ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
      {on ? t('common.active') : t('common.inactive')}
    </span>
  );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
          <Icon name="globe" className="h-6 w-6 text-emerald-600" /> Geografía
        </h1>
        <p className="mt-1 text-sm text-slate-500">Catálogo de países y ciudades (base para destinos, POIs y tours).</p>
      </div>

      <div className="mb-5 flex gap-2">
        <button type="button" className={tabCls('countries')} onClick={() => setTab('countries')}>Países · {countries.length}</button>
        <button type="button" className={tabCls('cities')} onClick={() => setTab('cities')}>Ciudades · {cities.length}</button>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400">{t('common.loading', 'Cargando…')}</div>
      ) : tab === 'countries' ? (
        <div className="space-y-4">
          {/* Alta país */}
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
            <input value={newCountry.name} onChange={(e) => setNewCountry((c) => ({ ...c, name: e.target.value }))}
              placeholder="Nombre del país" className={`${fieldClass} sm:flex-1`} />
            <input value={newCountry.code} onChange={(e) => setNewCountry((c) => ({ ...c, code: e.target.value }))}
              placeholder="Código (ISO, opc.)" maxLength={3} className={`${fieldClass} sm:w-40`} />
            <button type="button" onClick={addCountry} disabled={busy || !newCountry.name.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50">
              <Icon name="plus" className="h-4 w-4" /> {t('common.add')}
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr><th className="px-4 py-3">País</th><th className="px-4 py-3">Código</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">{t('common.actions')}</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {countries.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    {editCountry?.id === c.id ? (
                      <>
                        <td className="px-4 py-2"><input value={editCountry.name} onChange={(e) => setEditCountry({ ...editCountry, name: e.target.value })} className={fieldClass} /></td>
                        <td className="px-4 py-2"><input value={editCountry.code} maxLength={3} onChange={(e) => setEditCountry({ ...editCountry, code: e.target.value })} className={`${fieldClass} w-24`} /></td>
                        <td className="px-4 py-2">
                          <label className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={editCountry.is_active} onChange={(e) => setEditCountry({ ...editCountry, is_active: e.target.checked })} className="h-4 w-4 accent-emerald-600" /> {t('common.active')}</label>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <span className="inline-flex gap-2">
                            <button type="button" onClick={saveCountry} disabled={busy} className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{t('common.save')}</button>
                            <button type="button" onClick={() => setEditCountry(null)} className="text-xs text-slate-500 hover:text-slate-800">{t('common.cancel')}</button>
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                        <td className="px-4 py-3 text-slate-500">{c.code || '—'}</td>
                        <td className="px-4 py-3"><ActiveBadge on={c.is_active} /></td>
                        <td className="px-4 py-3 text-right">
                          {delCountry === c.id ? (
                            <span className="inline-flex items-center gap-2">
                              <button type="button" onClick={() => removeCountry(c.id)} disabled={busy} className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50">{t('common.delete')}</button>
                              <button type="button" onClick={() => setDelCountry(null)} className="text-xs text-slate-500 hover:text-slate-800">{t('common.cancel')}</button>
                            </span>
                          ) : (
                            <span className="inline-flex gap-1">
                              <button type="button" onClick={() => setEditCountry(c)} className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"><Icon name="pencil" className="h-4 w-4" /></button>
                              <button type="button" onClick={() => setDelCountry(c.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><Icon name="close" className="h-4 w-4" /></button>
                            </span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {countries.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">Aún no hay países.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Alta ciudad */}
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
            <select value={newCity.country} onChange={(e) => setNewCity((c) => ({ ...c, country: e.target.value ? Number(e.target.value) : '' }))} className={`${fieldClass} sm:w-56`}>
              <option value="">— País —</option>
              {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input value={newCity.name} onChange={(e) => setNewCity((c) => ({ ...c, name: e.target.value }))} placeholder="Nombre de la ciudad" className={`${fieldClass} sm:flex-1`} />
            <button type="button" onClick={addCity} disabled={busy || !newCity.name.trim() || !newCity.country}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-50">
              <Icon name="plus" className="h-4 w-4" /> {t('common.add')}
            </button>
          </div>

          {/* Filtro por país */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filtrar:</span>
            <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value ? Number(e.target.value) : '')} className={`${fieldClass} w-56`}>
              <option value="">Todos los países</option>
              {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr><th className="px-4 py-3">Ciudad</th><th className="px-4 py-3">País</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3 text-right">{t('common.actions')}</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {citiesShown.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    {editCity?.id === c.id ? (
                      <>
                        <td className="px-4 py-2"><input value={editCity.name} onChange={(e) => setEditCity({ ...editCity, name: e.target.value })} className={fieldClass} /></td>
                        <td className="px-4 py-2">
                          <select value={editCity.country} onChange={(e) => setEditCity({ ...editCity, country: Number(e.target.value) })} className={fieldClass}>
                            {countries.map((co) => <option key={co.id} value={co.id}>{co.name}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <label className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={editCity.is_active} onChange={(e) => setEditCity({ ...editCity, is_active: e.target.checked })} className="h-4 w-4 accent-emerald-600" /> {t('common.active')}</label>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <span className="inline-flex gap-2">
                            <button type="button" onClick={saveCity} disabled={busy} className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{t('common.save')}</button>
                            <button type="button" onClick={() => setEditCity(null)} className="text-xs text-slate-500 hover:text-slate-800">{t('common.cancel')}</button>
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                        <td className="px-4 py-3 text-slate-500">{c.country_name || countryName(c.country)}</td>
                        <td className="px-4 py-3"><ActiveBadge on={c.is_active} /></td>
                        <td className="px-4 py-3 text-right">
                          {delCity === c.id ? (
                            <span className="inline-flex items-center gap-2">
                              <button type="button" onClick={() => removeCity(c.id)} disabled={busy} className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50">{t('common.delete')}</button>
                              <button type="button" onClick={() => setDelCity(null)} className="text-xs text-slate-500 hover:text-slate-800">{t('common.cancel')}</button>
                            </span>
                          ) : (
                            <span className="inline-flex gap-1">
                              <button type="button" onClick={() => setEditCity(c)} className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"><Icon name="pencil" className="h-4 w-4" /></button>
                              <button type="button" onClick={() => setDelCity(c.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><Icon name="close" className="h-4 w-4" /></button>
                            </span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {citiesShown.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">Sin ciudades{filterCountry ? ' para este país' : ''}.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Geography;
