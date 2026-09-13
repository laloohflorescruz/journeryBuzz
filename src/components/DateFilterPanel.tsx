import { useMemo, useState } from 'react';
import Icon from './Icon';
import { dateRangeError } from '../lib/dateRange';
import { toISODate, fmtDayLong, type DateFilterValue } from '../lib/dateFilter';

// Panel de fechas compartido por Participantes, Reseñas y Reservas: calendario
// del mes con los días que tienen actividad, selección de un día concreto y
// rango desde/hasta. El rango respeta la regla de negocio (desde nunca
// posterior a hasta) y, mientras sea inválido, la pantalla no filtra por fechas.

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const fieldClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';
const labelClass = 'mb-1 block text-xs font-medium text-slate-600';

/** Rejilla del mes empezando en lunes; null = hueco antes del día 1. */
function monthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= days; d += 1) cells.push(new Date(year, month, d));
  return cells;
}

export default function DateFilterPanel({ value, onChange, countsByDay, noun, onClear }: {
  value: DateFilterValue;
  onChange: (v: DateFilterValue) => void;
  /** Cuántos registros hay por día (clave YYYY-MM-DD). */
  countsByDay: Map<string, number>;
  /** Singular/plural para el título del día: ['reserva', 'reservas']. */
  noun: [string, string];
  /** Si se pasa, se muestra el botón de limpiar todos los filtros. */
  onClear?: () => void;
}) {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const cells = monthGrid(cursor.year, cursor.month);
  const todayISO = toISODate(today);
  const rangeError = dateRangeError(value.from, value.to);

  const moveMonth = (delta: number) => setCursor(({ year, month }) => {
    const d = new Date(year, month + delta, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={() => moveMonth(-1)} aria-label="Mes anterior"
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
          <Icon name="arrow-left" className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold capitalize text-slate-800">
          {MONTH_NAMES[cursor.month]} {cursor.year}
        </span>
        <button type="button" onClick={() => moveMonth(1)} aria-label="Mes siguiente"
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
          <Icon name="arrow-right" className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-semibold uppercase text-slate-400">
        {WEEKDAYS.map((d, i) => <span key={`${d}-${i}`}>{d}</span>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <span key={`empty-${i}`} />;
          const iso = toISODate(date);
          const count = countsByDay.get(iso) ?? 0;
          const isSelected = value.day === iso;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onChange({ ...value, day: isSelected ? '' : iso })}
              title={count ? `${count} ${count === 1 ? noun[0] : noun[1]}` : `Sin ${noun[1]}`}
              className={`relative flex h-9 items-center justify-center rounded-lg text-sm transition-colors ${
                isSelected
                  ? 'bg-slate-900 font-semibold text-white'
                  : count
                    ? 'bg-emerald-50 font-medium text-emerald-800 hover:bg-emerald-100'
                    : 'text-slate-500 hover:bg-slate-100'
              } ${iso === todayISO && !isSelected ? 'ring-1 ring-emerald-400' : ''}`}
            >
              {date.getDate()}
              {count > 0 && (
                <span className={`absolute bottom-1 h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
              )}
            </button>
          );
        })}
      </div>

      {value.day && (
        <button type="button" onClick={() => onChange({ ...value, day: '' })}
          className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-900">
          Quitar el día {fmtDayLong(value.day)}
        </button>
      )}

      <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
        <div>
          <label className={labelClass}>Desde</label>
          <input type="date" value={value.from} max={value.to || undefined}
            onChange={(e) => onChange({ ...value, from: e.target.value })} className={fieldClass} />
        </div>
        <div>
          <label className={labelClass}>Hasta</label>
          <input type="date" value={value.to} min={value.from || undefined}
            onChange={(e) => onChange({ ...value, to: e.target.value })} className={fieldClass} />
        </div>
        {rangeError && <p className="text-xs text-red-600">{rangeError}</p>}
        {onClear && (
          <button type="button" onClick={onClear}
            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-900">
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
