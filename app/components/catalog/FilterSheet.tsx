'use client';

// app/components/catalog/FilterSheet.tsx
// Мобайл: bottom sheet. Десктоп: используется напрямую как sidebar-секция.

import { useState, useEffect } from 'react';
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { CATEGORIES, CITIES } from '@/app/lib/event-utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FilterState = {
  category: string;
  city: string;
  dateRange: 'all' | 'today' | 'tomorrow' | 'weekend' | 'month';
  priceMax: number | null;
  freeOnly: boolean;
  availableOnly: boolean;
  indoor: boolean | null; // null = any, true = indoor, false = outdoor
};

export const DEFAULT_FILTERS: FilterState = {
  category: '',
  city: '',
  dateRange: 'all',
  priceMax: null,
  freeOnly: false,
  availableOnly: true,
  indoor: null,
};

type FilterSheetProps = {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  resultCount?: number;
};

// ─── Date options ─────────────────────────────────────────────────────────────

const DATE_OPTIONS: { label: string; value: FilterState['dateRange'] }[] = [
  { label: 'Все даты',  value: 'all' },
  { label: 'Сегодня',   value: 'today' },
  { label: 'Завтра',    value: 'tomorrow' },
  { label: 'Выходные',  value: 'weekend' },
  { label: 'Этот месяц',value: 'month' },
];

const PRICE_OPTIONS = [
  { label: 'Любая',     value: null },
  { label: 'До 5 000',  value: 5000 },
  { label: 'До 10 000', value: 10000 },
  { label: 'До 20 000', value: 20000 },
];

// ─── FilterContent (shared between sheet and sidebar) ────────────────────────

export function FilterContent({
  filters,
  onChange,
  resultCount,
  onApply,
}: FilterSheetProps & { onApply?: () => void }) {
  const set = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    onChange({ ...filters, [key]: value });

  const activeCount = [
    filters.category !== '',
    filters.city !== '',
    filters.dateRange !== 'all',
    filters.priceMax !== null,
    filters.freeOnly,
    !filters.availableOnly,
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-5">

      {/* Category */}
      <section>
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2.5">
          Категория
        </p>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => set('category', cat.value)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition
                ${filters.category === cat.value
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-white/45 border border-white/8 hover:bg-white/10'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* City */}
      <section>
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2.5">
          Город
        </p>
        <div className="relative">
          <select
            value={filters.city}
            onChange={(e) => set('city', e.target.value)}
            className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-3 py-2.5
              text-sm text-white/70 focus:outline-none focus:border-white/25 transition"
          >
            <option value="">Все города</option>
            {CITIES.map((c) => (
              <option key={c} value={c} className="bg-[#1a1a1a]">
                {c}
              </option>
            ))}
          </select>
          <ChevronDown
            size={13}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
          />
        </div>
      </section>

      {/* Date */}
      <section>
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2.5">
          Когда
        </p>
        <div className="flex flex-col gap-1">
          {DATE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => set('dateRange', opt.value)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition
                ${filters.dateRange === opt.value
                  ? 'bg-orange-500/15 border border-orange-500/30 text-orange-400'
                  : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              {opt.label}
              {filters.dateRange === opt.value && (
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Price */}
      <section>
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2.5">
          Цена
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {PRICE_OPTIONS.map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => set('priceMax', opt.value)}
              className={`py-2 rounded-xl text-[11px] font-semibold transition border
                ${filters.priceMax === opt.value
                  ? 'bg-white/10 border-white/25 text-white'
                  : 'bg-white/3 border-white/8 text-white/40 hover:bg-white/7'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Toggles */}
      <section className="flex flex-col gap-2">
        {[
          { label: 'Только бесплатные',         key: 'freeOnly' as const },
          { label: 'Только с билетами в наличии', key: 'availableOnly' as const },
        ].map(({ label, key }) => (
          <button
            key={key}
            onClick={() => set(key, !filters[key])}
            className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/3
              border border-white/7 hover:border-white/15 transition"
          >
            <span className="text-sm text-white/60">{label}</span>
            <div
              className={`w-10 h-5.5 rounded-full border transition-all relative
                ${filters[key]
                  ? 'bg-orange-500/30 border-orange-500/50'
                  : 'bg-white/5 border-white/15'}`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full transition-all
                  ${filters[key]
                    ? 'left-[calc(100%-18px)] bg-orange-400'
                    : 'left-0.5 bg-white/30'}`}
              />
            </div>
          </button>
        ))}
      </section>

      {/* Indoor/Outdoor */}
      <section>
        <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2.5">
          Формат
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: 'Любой',   value: null },
            { label: 'Крытый',  value: true },
            { label: 'Открытый', value: false },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => set('indoor', opt.value)}
              className={`py-2 rounded-xl text-[11px] font-semibold transition border
                ${filters.indoor === opt.value
                  ? 'bg-white/10 border-white/25 text-white'
                  : 'bg-white/3 border-white/8 text-white/40 hover:bg-white/7'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {activeCount > 0 && (
          <button
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-white/40
              hover:text-white hover:border-white/25 transition"
          >
            Сбросить {activeCount > 0 && `(${activeCount})`}
          </button>
        )}
        {onApply && (
          <button
            onClick={onApply}
            className="flex-1 py-2.5 rounded-xl bg-[#FF4D00] text-white text-sm font-semibold
              hover:bg-[#e64400] transition"
          >
            {resultCount !== undefined ? `Показать ${resultCount}` : 'Применить'}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Mobile bottom sheet trigger + sheet ─────────────────────────────────────

export function FilterSheet(props: FilterSheetProps) {
  const [open, setOpen] = useState(false);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const activeCount = [
    props.filters.category !== '',
    props.filters.city !== '',
    props.filters.dateRange !== 'all',
    props.filters.priceMax !== null,
    props.filters.freeOnly,
  ].filter(Boolean).length;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-semibold transition
          ${activeCount > 0
            ? 'bg-orange-500/15 border-orange-500/30 text-orange-400'
            : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20'}`}
      >
        <SlidersHorizontal size={14} />
        Фильтры
        {activeCount > 0 && (
          <span className="w-4 h-4 rounded-full bg-orange-500 text-[9px] font-bold text-white flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-[#111111] border-t border-white/10
          rounded-t-3xl transition-transform duration-300 ease-out
          ${open ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxHeight: '85vh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/8">
          <span className="text-base font-bold text-white">Фильтры</span>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-white/50 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-5 py-4" style={{ maxHeight: 'calc(85vh - 80px)' }}>
          <FilterContent
            {...props}
            onApply={() => setOpen(false)}
          />
        </div>
      </div>
    </>
  );
}