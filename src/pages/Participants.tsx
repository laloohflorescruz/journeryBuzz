import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../components/Icon';

interface Participant {
  id: number;
  name: string;
  email: string;
  phone: string;
  tourName: string;
  date: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

const PAGE_SIZE = 8;

// Mismo lenguaje visual que Tours/POIs: badge sobrio por estado.
const STATUS_STYLE: Record<Participant['status'], string> = {
  confirmed: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-rose-50 text-rose-700',
};

const fmtDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString('es', { dateStyle: 'medium' }) : '—';

function Participants() {
  const { t } = useTranslation();
  const [selectedTour, setSelectedTour] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const participants: Participant[] = [
    { id: 1, name: 'Juan Pérez', email: 'juan.perez@example.com', phone: '+34 600 123 456', tourName: 'Tour por Madrid Centro', date: '2024-07-15', status: 'confirmed' },
    { id: 2, name: 'Maria Lopez', email: 'maria.lopez@example.com', phone: '+34 600 654 321', tourName: 'Tour Gaudí Barcelona', date: '2024-07-20', status: 'confirmed' },
    { id: 3, name: 'Carlos García', email: 'carlos.garcia@example.com', phone: '+39 600 987 654', tourName: 'Tour Roma Antigua', date: '2024-08-01', status: 'pending' },
    { id: 4, name: 'Ana Martínez', email: 'ana.martinez@example.com', phone: '+33 600 321 987', tourName: 'Tour París Iluminado', date: '2024-08-10', status: 'confirmed' },
    { id: 5, name: 'Luis Fernández', email: 'luis.fernandez@example.com', phone: '+31 600 456 789', tourName: 'Tour Amsterdam Canales', date: '2024-08-15', status: 'cancelled' },
    { id: 6, name: 'Elena Ruiz', email: 'elena.ruiz@example.com', phone: '+34 600 789 012', tourName: 'Tour por Madrid Centro', date: '2024-08-20', status: 'confirmed' },
    { id: 7, name: 'Pedro Sánchez', email: 'pedro.sanchez@example.com', phone: '+34 600 345 678', tourName: 'Tour Gaudí Barcelona', date: '2024-08-25', status: 'confirmed' },
  ];

  const tourNames = ['All', ...Array.from(new Set(participants.map((p) => p.tourName)))];

  const filtered = participants.filter((p) => {
    const matchTour = selectedTour === 'All' || p.tourName === selectedTour;
    const q = search.trim().toLowerCase();
    const matchSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q);
    return matchTour && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getStatusLabel = (status: string) => {
    if (status === 'confirmed') return t('common.confirmed');
    if (status === 'pending') return t('common.pending');
    if (status === 'cancelled') return t('common.cancelled');
    return status;
  };

  const isFiltered = selectedTour !== 'All' || search.trim() !== '';

  return (
    <div className="mx-auto max-w-5xl">
      {/* Encabezado */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
            <Icon name="users" className="h-6 w-6 text-emerald-600" /> {t('participants.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {filtered.length} {filtered.length === 1 ? 'participante' : 'participantes'}
            {isFiltered ? ' (filtrados)' : ' en total'}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Buscar por nombre o email…"
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <select
          value={selectedTour}
          onChange={(e) => { setSelectedTour(e.target.value); setCurrentPage(1); }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:w-64"
        >
          {tourNames.map((tour) => (
            <option key={tour} value={tour}>{tour === 'All' ? t('common.all') : tour}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Icon name="users" className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            {participants.length === 0 ? 'Aún no hay participantes' : 'Ningún participante coincide con el filtro'}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{t('participants.subtitle')}</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">{t('participants.participantName')}</th>
                  <th className="px-4 py-3">{t('participants.phone')}</th>
                  <th className="px-4 py-3">Tour</th>
                  <th className="px-4 py-3">{t('common.date')}</th>
                  <th className="px-4 py-3">{t('common.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                          {p.name.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800">{p.name}</p>
                          <p className="truncate text-xs text-slate-400">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.phone || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{p.tourName}</td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(p.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[p.status]}`}>
                        {getStatusLabel(p.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={page === 1}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:bg-transparent"
              >
                {t('common.previous')}
              </button>
              <span className="text-sm text-slate-500">{t('common.pageOf', { current: page, total: totalPages })}</span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={page === totalPages}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:bg-transparent"
              >
                {t('common.next')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Participants;
